from flask import Flask, request, jsonify
import pandas as pd
from surprise import Dataset, Reader, SVD
from data_loader import load_data
from surprise.model_selection import train_test_split
import os

app = Flask(__name__)

data_file = os.path.join(os.path.dirname(__file__), "recomandations.csv")
data = load_data(data_file, filter_purchases_only=False)
user_model, trainset, testset = None, None, None

# Funcția pentru a obține cele mai populare 15 produse
def top15_popular_products(file_path):
    data = pd.read_csv(file_path)
    purchased_data = data[data['action'] == 'purchased']
    popular_products = purchased_data.groupby(['productId']).size().reset_index(name='purchased')
    return popular_products.head(15)

def train_svd_model(data):
    """
    Antrenează modelul SVD și returnează modelul antrenat.
    """
    reader = Reader(rating_scale=(1, 3))
    dataset = Dataset.load_from_df(data[['userId', 'productId', 'rating']], reader)
    trainset, testset = train_test_split(dataset, test_size=0.2)
    
    svd_model = SVD(n_factors=50, lr_all=0.005, reg_all=0.02)
    svd_model.fit(trainset)
    
    return svd_model, trainset

@app.route("/recommendations", methods=["GET"])
def get_recommendations():
    user_id = request.args.get('user_id')
    product_id = request.args.get('product_id')
    filter_type = request.args.get('filter_type', 'strict')
    
    global data, user_model, trainset
    
    # Antrenăm modelul dacă nu este deja antrenat
    if user_model is None:
        filter_purchases_only = filter_type == "strict"
        data = load_data(data_file, filter_purchases_only=filter_purchases_only)
        user_model, trainset = train_svd_model(data)
    
    # Generăm recomandări utilizând SVD
    all_products = data['productId'].unique()
    predictions = [(pid, user_model.predict(user_id, pid).est) for pid in all_products]
    predictions.sort(key=lambda x: x[1], reverse=True)
    
    recommended_products = [pid for pid, _ in predictions[:10]]
    
    return jsonify({
        "user_id": user_id,
        "recommendations": recommended_products
    })

@app.route("/top15", methods=["GET"])
def get_top15_popular_products():
    file_path = os.path.join(os.path.dirname(__file__), "recomandations.csv")
    top15 = top15_popular_products(file_path)
    return jsonify(top15.to_dict(orient='records'))

if __name__ == "__main__":
    app.run(debug=True, port=5000)
