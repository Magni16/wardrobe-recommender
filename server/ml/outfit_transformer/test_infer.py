# server/ml/outfit_transformer/test_infer.py

from infer import OutfitScorer

# Sample test images (use actual working image URLs from your DB or Cloudinary)
shirt_url = "https://res.cloudinary.com/demo/image/upload/shirt_sample.jpg"
jeans_url = "https://res.cloudinary.com/demo/image/upload/jeans_sample.jpg"
shoes_url = "https://res.cloudinary.com/demo/image/upload/shoes_sample.jpg"

scorer = OutfitScorer()
score = scorer.get_outfit_score(shirt_url, jeans_url, shoes_url)

print("Compatibility score:", score)
