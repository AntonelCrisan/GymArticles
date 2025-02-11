from flask import Flask, request, jsonify
import pandas as pd
from surprise import Dataset, Reader, KNNBaseline
from surprise import accuracy
from sklearn.metrics import r2_score
import os
import matplotlib.pyplot as plt
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np


app = Flask(__name__)

data_file = os.path.join(os.path.dirname(__file__), "recommendations.csv")
data = None
user_model, trainset = None, None

def load_data(file_path):
    data = pd.read_csv(file_path)

    action_to_rating = {
        "purchased": 5.0,
        "added_to_cart": 4.5,
        "added_to_favorite": 3.5,
        "viewed": 2.0  
    }

    data['rating'] = data['action'].map(action_to_rating)

    # Convertim timestamp-ul în datetime pentru a ține cont de recență
    data['timestamp'] = pd.to_datetime(data['timestamp'], unit='s')
    max_time = data['timestamp'].max()
    
    # Penalizăm acțiunile vechi și favorizăm acțiunile recente
    data['time_decay'] = (max_time - data['timestamp']).dt.days
    data['time_decay'] = np.exp(-data['time_decay'] / 2)

    data['price'] = (data['price'] - data['price'].min()) / (data['price'].max() - data['price'].min())

    # Aplicăm atenuarea la rating
    data['rating'] *= data['time_decay']

    # Ajustăm pentru interacțiuni frecvente
    data['rating'] += data.groupby(['userId', 'productId'])['action'].transform('count') * 0.2
    data['rating'] = data['rating'].clip(1, 5)

    return data
#Funcția pentru a obține cele mai populare 15 produse
def top15_popular_products(file_path):
    data = pd.read_csv(file_path)
    purchased_data = data[data['action'] == 'purchased']
    popular_products = purchased_data.groupby(['productId']).size().reset_index(name='purchased')
    return popular_products.head(15)

#Funcția pentru antrenarea modelului KNN (fără scurgere de date)
def train_knn_model(data):
    reader = Reader(rating_scale=(1, 5))
    dataset = Dataset.load_from_df(data[['userId', 'productId', 'rating']], reader)
    trainset = dataset.build_full_trainset()  # Antrenăm pe toate datele disponibile
    testset = trainset.build_testset()  # Folosim un test set separat
    knn_model = KNNBaseline()
    knn_model.fit(trainset)
    global pred
    pred = knn_model.test(testset)  # Testăm pe date care NU au fost văzute
    return knn_model, trainset

#Funcția de filtrare pe bază de conținut
def content_based_recommendations(data, product_id, top_n=15):
    data["features"] = data[['category', 'subcategory', 'price']].apply(lambda x: ' '.join(x.astype(str)), axis=1)
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data["features"])
    cosine_sim = cosine_similarity(X, X)
    
    # Obținem recomandările pentru produsul dat
    product_index = data[data['productId'] == product_id].index[0]
    similar_products = cosine_sim[product_index]
    
    # Sortează produsele pe baza similarității
    similar_product_indices = similar_products.argsort()[-top_n:][::-1]
    recommended_products = data.iloc[similar_product_indices]['productId'].tolist()
    
    return recommended_products



# Funcție care combină filtrarea pe conținut, co-ocurență și modelul ML (KNN)
def cart_recommendations(data, user_model, trainset, user_id, product_id, top_n=15):
    """ Recomandă produse relevante folosind ML (KNN) + conținut + co-ocurență """

    #  PAS 1: Filtrare pe bază de conținut (similaritate de produs)
    data["features"] = data[['category', 'subcategory', 'price']].apply(lambda x: ' '.join(x.astype(str)), axis=1)
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data["features"])
    cosine_sim = cosine_similarity(X, X)

    product_index = data[data['productId'] == product_id].index[0]
    similar_products = cosine_sim[product_index]
    similar_product_indices = similar_products.argsort()[-(top_n + 1):][::-1]
    content_recommendations = data.iloc[similar_product_indices]['productId'].tolist()

    #  PAS 2: Co-ocurență (produse cumpărate împreună)
    purchased_together = data[data['action'] == 'purchased'].groupby('userId')['productId'].apply(list)
    co_occur = {}
    for products in purchased_together:
        if product_id in products:
            for p in products:
                if p != product_id:
                    co_occur[p] = co_occur.get(p, 0) + 1
    co_occurrence_recommendations = sorted(co_occur, key=co_occur.get, reverse=True)[:top_n]

    #  PAS 3: Recomandări bazate pe modelul KNN
    all_products = data['productId'].unique()
    predictions = []
    
    for pid in all_products:
        try:
            pred = user_model.predict(user_id, pid)
            predictions.append((pid, pred.est))
        except:
            continue

    predictions.sort(key=lambda x: x[1], reverse=True)
    knn_recommendations = [pid for pid, _ in predictions[:top_n]]

    #  PAS 4: Combinăm toate metodele
    hybrid_recommendations = list(set(content_recommendations + co_occurrence_recommendations + knn_recommendations))[:top_n]

    return hybrid_recommendations
    

# Endpoint pentru recomandări bazate pe coș cu ML
@app.route("/cart-recommendations", methods=["GET"])
def get_cart_recommendations():
    user_id = request.args.get('user_id')
    product_id = request.args.get('product_id')

    if not user_id or not product_id:
        return jsonify({"error": "Missing user_id or product_id"}), 400

    recommended_products = cart_recommendations(data, user_model, trainset, user_id, product_id, top_n=15)
   
    return jsonify({
        "user_id": user_id,
        "product_id": product_id,
        "recommended_products": recommended_products
    })

#Endpoint pentru recomandări
@app.route("/recommendations", methods=["GET"])
def get_recommendations():
    
    user_id = request.args.get('user_id')
    
    global data, user_model, trainset
    print("Antrenare model KNN...")
    data = load_data(data_file)
    user_model, trainset = train_knn_model(data)
    print("Model antrenat cu succes!")
    # Generăm recomandări colaborative folosind KNN
    all_products = data['productId'].unique()
    predictions = [(pid, user_model.predict(user_id, pid).est) for pid in all_products]
    predictions.sort(key=lambda x: x[1], reverse=True)
    collaborative_recommendations = [pid for pid, _ in predictions[:15]]
    
    # Generăm recomandări pe bază de conținut
    content_recommendations = content_based_recommendations(data, collaborative_recommendations[0], top_n=15)
    
    # Combinăm recomandările
    hybrid_recommendations = list(set(collaborative_recommendations + content_recommendations))[:15]

    #Calculăm RMSE și MAE
    print("########## EROAREA MODELULUI ##########")
    accuracy.rmse(pred)
    accuracy.mae(pred)
    print("########## SCORUL MODELULUI ##########")
    #Plot pentru predicțiile vs valorile reale
    real_values = [p.r_ui for p in pred]
    predicted_values = [p.est for p in pred]

    #Calculăm scorul R-squared
    r2 = r2_score(real_values, predicted_values)
    print(f"R-squared: {r2}")
    

    
    return jsonify({
        "user_id": user_id,
        "recommendations": hybrid_recommendations
    })

#Endpoint pentru top 15 produse populare
@app.route("/top15", methods=["GET"])
def get_top15_popular_products():
    top15 = top15_popular_products(data_file)
    return jsonify(top15.to_dict(orient='records'))

#Pornirea serverului Flask
if __name__ == "__main__":
    app.run(debug=True, port=5000)
