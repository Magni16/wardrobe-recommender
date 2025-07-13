# server/ml/feature_extractor.py

import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import requests
from io import BytesIO

# Load pretrained ResNet50 model (once)
resnet = models.resnet50(pretrained=True)
resnet.eval()

# Remove classification layer — now acts as feature extractor
feature_extractor = torch.nn.Sequential(*list(resnet.children())[:-1])

# Preprocessing steps to match ResNet50 expectations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],  # ImageNet mean
        std=[0.229, 0.224, 0.225]    # ImageNet std
    )
])

def extract_features(image_url: str) -> list:
    """Extracts a 2048-d feature vector from an image URL using ResNet50."""
    try:
        response = requests.get(image_url)
        img = Image.open(BytesIO(response.content)).convert("RGB")
        img_tensor = transform(img).unsqueeze(0)

        with torch.no_grad():
            features = feature_extractor(img_tensor)

        flattened = features.squeeze().numpy()  # (2048,)
        return flattened.tolist()

    except Exception as e:
        print(f"[Feature Extraction Error] {e}")
        return []
