import torch
import numpy as np
from server.ml.outfit_transformer.model import OutfitTransformer  # or appropriate import
from server.ml.outfit_transformer.utils import preprocess_input  # adjust to real utility

# Load model
model = OutfitTransformer.load_pretrained("path/to/checkpoint.pt")  # adjust path
model.eval()

def get_outfit_recommendations(items):
    # Group items by category
    tops = [item for item in items if item['category'] == 'shirt']
    bottoms = [item for item in items if item['category'] == 'jeans']
    shoes = [item for item in items if item['category'] == 'shoes']

    outfits = []

    for top in tops:
        for bottom in bottoms:
            for shoe in shoes:
                features = [top['features'], bottom['features'], shoe['features']]
                features_tensor = torch.tensor([features])  # Shape: (1, 3, 2048)

                with torch.no_grad():
                    score = model(features_tensor).item()

                outfits.append({
                    "top": top["imageUrl"],
                    "bottom": bottom["imageUrl"],
                    "shoes": shoe["imageUrl"],
                    "score": score
                })

    # Return top 3
    outfits.sort(key=lambda x: x["score"], reverse=True)
    return outfits[:3]
