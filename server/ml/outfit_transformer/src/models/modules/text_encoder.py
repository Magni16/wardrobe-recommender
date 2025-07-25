# -*- coding:utf-8 -*-
"""
Author:
    Wonjun Oh, owj0421@naver.com
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import Tensor
from transformers import (
    AutoModel, 
    AutoTokenizer, 
    CLIPTokenizer, 
    CLIPTextModelWithProjection,
)
from typing import Literal
from torchvision import datasets, transforms
from abc import ABC, abstractmethod
from typing import List
from PIL import Image
from typing import Dict, Any, Optional

from ...utils.model_utils import freeze_model, mean_pooling
    
class BaseTextEncoder(nn.Module, ABC):
    def __init__(self):
        super().__init__()

    @property
    def device(self) -> torch.device:
        return next(self.parameters()).device
    
    @property
    @abstractmethod
    def d_embed(self) -> int:
        raise NotImplementedError('The d_embed property must be implemented by subclasses.')

    @abstractmethod
    def _forward(
        self, 
        texts: List[List[str]]
    ) -> torch.Tensor:
        raise NotImplementedError('The embed method must be implemented by subclasses.')

    def forward(
        self, 
        texts: List[List[str]], 
        normalize: bool = True,
        *args, **kwargs
    ) -> torch.Tensor:
        if len(set(len(text_seq) for text_seq in texts)) > 1:
            raise ValueError('All sequences in texts should have the same length.')
        
        text_embeddings = self._forward(texts, *args, **kwargs)
        
        if normalize:
            text_embeddings = F.normalize(text_embeddings, p=2, dim=-1)
            
        return text_embeddings
        
        
class HuggingFaceTextEncoder(BaseTextEncoder):
    
    def __init__(
        self,
        embedding_size,
        model_name_or_path: str = "sentence-transformers/all-MiniLM-L6-v2",
        freeze: bool = True
    ):
        super().__init__()
        self._d_embed = embedding_size
        self.model = AutoModel.from_pretrained(model_name_or_path)
        if freeze:
            freeze_model(self.model)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name_or_path)
        self.proj = nn.Linear(
            in_features=self.model.config.hidden_size, 
            out_features=embedding_size
        )
        
    @property
    def d_embed(self) -> int:
        return self.proj.out_features
    
    @torch.no_grad()
    def _forward(
        self, 
        texts: List[List[str]],
        tokenizer_kargs: Dict[str, Any] = None
    ) -> Tensor:
        batch_size = len(texts)
        texts = sum(texts, [])

        tokenizer_kargs = tokenizer_kargs if tokenizer_kargs is not None else {
            'max_length': 32,
            'padding': 'max_length',
            'truncation': True,
        }
        
        tokenizer_kargs['return_tensors'] = 'pt'
        
        inputs = self.tokenizer(
            texts, **self.tokenizer_args
        )
        inputs = {
            key: value.to(self.device) for key, value in inputs.items()
        }
        outputs = mean_pooling(
            model_output=self.model(**inputs), 
            attention_mask=inputs['attention_mask']
        )
        text_embeddings = self.proj(
            outputs
        )
        text_embeddings = text_embeddings.view(
            batch_size, -1, self.d_embed
        )

        return text_embeddings
    
    
class CLIPTextEncoder(BaseTextEncoder):
    
    def __init__(
        self,
        model_name_or_path: str = 'patrickjohncyh/fashion-clip',
        freeze: bool = True
    ):
        super().__init__()
        self.model = CLIPTextModelWithProjection.from_pretrained(
            model_name_or_path, weights_only=False
        )
        self.model.eval()
        if freeze:
            freeze_model(self.model)
        self.tokenizer = CLIPTokenizer.from_pretrained(
           model_name_or_path
        )
        
    @property
    def d_embed(self) -> int:
        return self.model.config.projection_dim
    
    @torch.no_grad()
    def _forward(
        self, 
        texts: List[List[str]],
        tokenizer_kargs: Dict[str, Any] = None
    ) -> Tensor:
        batch_size = len(texts)
        texts: List[str] = sum(texts, [])
        
        tokenizer_kargs = tokenizer_kargs if tokenizer_kargs is not None else {
            'max_length': 64,
            'padding': 'max_length',
            'truncation': True,
        }
        tokenizer_kargs['return_tensors'] = 'pt'
        
        inputs = self.tokenizer(
            text=texts, **tokenizer_kargs
        )
        
        inputs = {
            key: value.to(self.device) for key, value in inputs.items()
        }
        
        text_embeddings = self.model(
            **inputs
        ).text_embeds
        
        text_embeddings = text_embeddings.view(
            batch_size, -1, self.d_embed
        )
            
        return text_embeddings