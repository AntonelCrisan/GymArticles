from flask import Flask, request, jsonify
import pandas as pd
from surprise import Dataset, Reader, SVD
from data_loader import load_data
from surprise.model_selection import train_test_split
import os

app = Flask(__name__)

data_file = os.path.join(os.path.dirname(__file__), "recomandations.csv")
data = load_data(data_file, filter_purchases_only=False)
user_model, trainset = None, None

def train_svd_model(data):
    reader = Reader(rating_scale=(1, 3))
    dataset = Dataset.load_from_df(data[['userId', 'productId', 'rating']], reader)
    trainset, _ = train_test_split(dataset, test_size=0.2)
    
    svd = SVD(n_factors=50, lr_all=0.005, reg_all=0.02)
    svd.fit(trainset)
    
    return svd, trainset

@app.route("/recommendations", methods=["GET"])
def get_recommendations():
    user_id = request.args.get('user_id')
    
    global data, user_model, trainset
    
    if user_model is None:
        user_model, trainset = train_svd_model(data)
    
    try:
        all_products = data[['productId', 'productName']].drop_duplicates()
        user_products = data[data['userId'] == int(user_id)][['productId']]
        
        unrated_products = all_products[~all_products['productId'].isin(user_products['productId'])]
        unrated_products['predicted_rating'] = unrated_products['productId'].apply(lambda pid: user_model.predict(int(user_id), pid).est)
        
        top_recommendations = unrated_products.sort_values(by='predicted_rating', ascending=False).head(10)
        
        recommendations = top_recommendations[['productId', 'productName']].to_dict(orient='records')
        
    except ValueError:
        return jsonify({"error": "User ID not found in dataset"}), 400
    
    return jsonify({
        "user_id": user_id,
        "recommendations": recommendations
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
