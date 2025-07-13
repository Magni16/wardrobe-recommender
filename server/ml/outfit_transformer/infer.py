import numpy as np
import torch
import requests
from PIL import Image
from torchvision import transforms
from io import BytesIO
import os
from server.ml.outfit_transformer.src.models.outfit_transformer import OutfitTransformer
from server.ml.outfit_transformer.src.models.outfit_transformer import OutfitTransformerConfig
from server.ml.outfit_transformer.src.data.datatypes import FashionCompatibilityQuery, FashionItem


# Optional: Set CUDA if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHECKPOINT_PATH = os.path.join(BASE_DIR, "checkpoints", "compatibillity_clip_best.pth")


class OutfitScorer:
    def __init__(self):
        from server.ml.outfit_transformer.src.models.outfit_transformer import OutfitTransformer  # import here to avoid circular issues

        # self.model = OutfitTransformer()

        clip_config = OutfitTransformerConfig(
            item_enc_text_model_name="patrickjohncyh/fashion-clip",  # ✅ Trained CLIP version
            item_enc_dim_per_modality=512,
            item_enc_norm_out=True,
            aggregation_method='concat',
            transformer_n_head=8,
            transformer_d_ffn=2024,
            transformer_n_layers=6,
            transformer_dropout=0.1,
            transformer_norm_out=True,
            d_embed=128
        )

        self.model = OutfitTransformer(cfg=clip_config)

        checkpoint = torch.load(CHECKPOINT_PATH, map_location=device)
        print(checkpoint.keys())
        self.model.load_state_dict(checkpoint["model"])

        self.model.to(device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.48145466, 0.4578275, 0.40821073],  # CLIP normalization
                std=[0.26862954, 0.26130258, 0.27577711]
            )
        ])

    def _image_to_tensor(self, url):
        """Download and preprocess image from Cloudinary URL"""
        try:
            response = requests.get(url)
            img = Image.open(BytesIO(response.content)).convert("RGB")
            img_tensor = self.transform(img).unsqueeze(0).to(device)
            return img, img_tensor  # return both
        except Exception as e:
            print(f"Failed to process image: {url}")
            return None, None

    def get_outfit_score(self, shirt_url, jeans_url, shoes_url):
        shirt_img, shirt_tensor = self._image_to_tensor(shirt_url)
        jeans_img, jeans_tensor = self._image_to_tensor(jeans_url)
        shoes_img, shoes_tensor = self._image_to_tensor(shoes_url)

        if any(t is None for t in [shirt_img, jeans_img, shoes_img]):
            return -1.0

        # Create FashionItems with raw PIL image
        shirt_item = FashionItem(category="shirt", image=shirt_img, description="shirt")
        jeans_item = FashionItem(category="jeans", image=jeans_img, description="jeans")
        shoes_item = FashionItem(category="shoes", image=shoes_img, description="shoes")

        query = FashionCompatibilityQuery(outfit=[shirt_item, jeans_item, shoes_item])

        with torch.no_grad():
            score = self.model([query])
            return score.item()
