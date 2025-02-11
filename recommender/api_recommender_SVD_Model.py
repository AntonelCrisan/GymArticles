from flask import Flask, request, jsonify
import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
from surprise import accuracy
from sklearn.metrics import r2_score
import os
import matplotlib.pyplot as plt
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler, StandardScaler
import numpy as np

app = Flask(__name__)

data_file = os.path.join(os.path.dirname(__file__), "recommendations.csv")
data = None
user_model, trainset, pred = None, None, None

# Încarcă datele
def load_data(file_path):
    data = pd.read_csv(file_path)
    # Mapăm acțiunile la rating-uri
    action_to_rating = {
        "purchased": 5.00,  # Mărește valoarea pentru achiziții
        "added_to_cart": 3.00,
        "added_to_favorite": 2.50,
        "viewed": 1.00
    }
    data['rating'] = data['action'].map(action_to_rating)
    return data

# Preprocesarea caracteristicilor (scalare și îmbogățirea datelor)
def preprocess_data(data):
    # Scalarea prețurilor
    scaler = MinMaxScaler()
    data['price'] = scaler.fit_transform(data[['price']])

    # Creăm o coloană cu trăsături de tip text pentru categorii și subcategorii
    data["features"] = data[['category', 'subcategory']].apply(lambda x: ' '.join(x.astype(str)), axis=1)
    return data

# Funcția pentru antrenarea modelului SVD (Matrix Factorization)
def train_svd_model(data):
    reader = Reader(rating_scale=(1, 5))
    dataset = Dataset.load_from_df(data[['userId', 'productId', 'rating']], reader)
    trainset, testset = train_test_split(dataset, test_size=0.2)
    svd_model = SVD()
    svd_model.fit(trainset)
    global pred
    pred = svd_model.test(testset)  # Testăm pe date care NU au fost văzute
    for p in pred[:30]:
        print(f"Real: {p.r_ui}, Predicted: {p.est}")
    return svd_model, trainset

# Funcția pentru recomandări pe bază de conținut
def content_based_recommendations(data, product_id, top_n=15):
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data["features"])
    
    cosine_sim = cosine_similarity(X, X)
    product_index = data[data['productId'] == product_id].index[0]
    similar_products = cosine_sim[product_index]
    
    similar_product_indices = similar_products.argsort()[-top_n:][::-1]
    recommended_products = data.iloc[similar_product_indices]['productId'].tolist()
    
    return recommended_products

# Antrenare model SVD la pornirea serverului
with app.app_context():
    print("Antrenare model SVD la pornirea serverului...")
    data = load_data(data_file)
    data = preprocess_data(data)
    user_model, trainset = train_svd_model(data)
    print("Model SVD antrenat cu succes!")

# Endpoint pentru recomandări
@app.route("/recommendations", methods=["GET"])
def get_recommendations():
    user_id = request.args.get('user_id')
    
    global data, user_model, trainset

    # Generăm recomandări colaborative folosind SVD
    all_products = data['productId'].unique()
    predictions = [(pid, user_model.predict(user_id, pid).est) for pid in all_products]
    predictions.sort(key=lambda x: x[1], reverse=True)
    collaborative_recommendations = [pid for pid, _ in predictions[:15]]
    
    
    # Generăm recomandări pe bază de conținut
    content_recommendations = content_based_recommendations(data, collaborative_recommendations[0], top_n=15)
    
    # Combinăm recomandările
    hybrid_recommendations = list(set(collaborative_recommendations + content_recommendations))[:15]
   #Calculăm RMSE și MAE
    rmse = accuracy.rmse(pred)
    mae = accuracy.mae(pred)
    print(f"RMSE: {rmse}")
    print(f"MAE: {mae}")
    
    #Plot pentru predicțiile vs valorile reale
    real_values = [p.r_ui for p in pred]
    predicted_values = [p.est for p in pred]

    #Calculăm scorul R-squared
    r2 = r2_score(real_values, predicted_values)
    print(f"R-squared: {r2}")
    
    return jsonify({
        "user_id": user_id,
        "recommendations": hybrid_recommendations,
    })

# Endpoint pentru top 15 produse populare
@app.route("/top15", methods=["GET"])
def get_top15_popular_products():
    popular_products = data.groupby('productId').size().reset_index(name='count')
    top15 = popular_products.sort_values(by='count', ascending=False).head(15)
    return jsonify(top15.to_dict(orient='records'))

# Pornirea serverului Flask
if __name__ == "__main__":
    app.run(debug=True, port=5000)
