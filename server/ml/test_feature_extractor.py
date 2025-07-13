from server.ml.feature_extractor import extract_features

test_url = "https://res.cloudinary.com/demo/image/upload/sample.jpg"  # or use one of your own uploaded clothing images

features = extract_features(test_url)

print(f"Feature vector length: {len(features)}")
print(f"First 5 features: {features[:5]}")
