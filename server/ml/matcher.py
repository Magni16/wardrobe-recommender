from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def find_similar_items(selected_vector, all_items, target_category):
    similarities = []
    for item in all_items:
        if item.get("category") == target_category:
            score = cosine_similarity([selected_vector], [item["features"]])[0][0]
            similarities.append((item, score))
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:3]
