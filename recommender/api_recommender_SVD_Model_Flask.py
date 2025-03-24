from flask import Flask, request, jsonify
import pandas as pd
from sklearn.preprocessing import StandardScaler
from surprise import SVD, Dataset, Reader
from surprise.model_selection import GridSearchCV
from surprise import accuracy
from sklearn.metrics import r2_score
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import matplotlib.pyplot as plt
import numpy as np
import os

app = Flask(__name__)

data_file = os.path.join(os.path.dirname(__file__), "recommendations.csv")
data = None
user_model = None
trainset = None
pred = None


def load_data(file_path):
    data = pd.read_csv(file_path)

    action_to_rating = {
       "purchased": 5.0,
        "added_to_cart": 4.5,
        "added_to_favorite": 3.5,
        "viewed": 3.0   
    }

    data['rating'] = data['action'].map(action_to_rating)
    data['timestamp'] = pd.to_datetime(data['timestamp'], unit='s')

    # Ajustăm decăderea temporală pentru a nu penaliza excesiv produsele noi
    max_time = data['timestamp'].max()
    data['time_decay'] = (max_time - data['timestamp']).dt.days
    data['time_decay'] = np.exp(-data['time_decay'] / 14)  #Pentru produsele mai recente de 14 zile

    # Normalizăm prețul folosind StandardScaler
    scaler = StandardScaler()
    data['price'] = scaler.fit_transform(data[['price']])
    
    # Calculăm rating-ul final
    data['rating'] *= data['time_decay']
    data['rating'] += data.groupby(['userId', 'productId'])['action'].transform('count') * 0.5  # Ajustat la 0.5
    data['rating'] = data['rating'].clip(3, 5)  # Extindem intervalul pentru a include valori mai mici
    return data

def train_svd_model(data):
    reader = Reader(rating_scale=(3, 5))
    dataset = Dataset.load_from_df(data[['userId', 'productId', 'rating']], reader)
    trainset = dataset.build_full_trainset()
    
    # Optimizăm hiperparametrii folosind GridSearchCV
    param_grid = {
        'n_factors': [50, 100, 150],
        'n_epochs': [20, 30, 40],
        'lr_all': [0.002, 0.005, 0.01],
        'reg_all': [0.02, 0.1, 0.2]
    }
    gs = GridSearchCV(SVD, param_grid, measures=['rmse', 'mae'], cv=3)
    gs.fit(dataset)
    print("########## EROAREA MODELULUI ##########")
    print(f"Best RMSE: {gs.best_score['rmse']}")
    print(f"Best MAE: {gs.best_score['mae']}")
    print(f"Best Parameters: {gs.best_params['rmse']}")
    
    # Antrenăm modelul cu cei mai buni parametri
    best_model = SVD(**gs.best_params['rmse'])
    best_model.fit(trainset)
    
    global pred
    testset = trainset.build_testset()
    pred = best_model.test(testset)
    return best_model, trainset


def calculate_classification_metrics(real_values, predicted_values, threshold=3.5):
    pred_binary = [1 if pred >= threshold else 0 for pred in predicted_values]
    real_binary = [1 if real >= threshold else 0 for real in real_values]
    
    precision = precision_score(real_binary, pred_binary)
    recall = recall_score(real_binary, pred_binary)
    f1 = f1_score(real_binary, pred_binary)
    
    return precision, recall, f1

def initialize_model():
    global data, user_model, trainset
    print("Antrenare model ...")
    data = load_data(data_file)
    user_model, trainset = train_svd_model(data)
    print("Model antrenat cu succes!")
    print("########## SCORUL MODELULUI ##########")
    real_values = [p.r_ui for p in pred]
    predicted_values = [p.est for p in pred]
    r2 = r2_score(real_values, predicted_values)
    print(f"R-squared: {r2}")
    
    precision, recall, f1 = calculate_classification_metrics(real_values, predicted_values)
    print(f"Precision: {precision}")
    print(f"Recall: {recall}")
    print(f"F1-Score: {f1}")

     # Linia de regresie
    coefficients = np.polyfit(real_values, predicted_values, 1)
    regression_line = np.polyval(coefficients, real_values)

    # Graficul
    plt.figure(figsize=(10, 6))
    plt.scatter(real_values, predicted_values, color='green', label='Valori prezise')
    plt.plot(real_values, regression_line, color='red', label='Linie de regresie', linewidth=2)

    # Adăugăm etichete și legendă
    plt.title("Grafic Valori Reale vs. Valori Prezise")
    plt.xlabel("Valori Reale")
    plt.ylabel("Valori Prezise")
    plt.legend()
    plt.grid(True)
    plt.show()

#Funcția de filtrare pe bază de conținut
def content_based_recommendations(data, product_id, top_n=20):
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
def cart_recommendations(data, product_id, top_n=15):
    """ Recomandă produse relevante folosind ML (SVD) + conținut + co-ocurență """

    #Filtrare pe bază de conținut (similaritate de produs)
    data["features"] = data[['category', 'subcategory', 'price']].apply(lambda x: ' '.join(x.astype(str)), axis=1)
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data["features"])
    cosine_sim = cosine_similarity(X, X)

    product_index = data[data['productId'] == product_id].index[0]
    similar_products = cosine_sim[product_index]
    similar_product_indices = similar_products.argsort()[-(top_n + 1):][::-1]
    content_recommendations = data.iloc[similar_product_indices]['productId'].tolist()

    #Co-ocurență (produse cumpărate împreună)
    purchased_together = data[data['action'] == 'purchased'].groupby('userId')['productId'].apply(list)
    co_occur = {}
    for products in purchased_together:
        if product_id in products:
            for p in products:
                if p != product_id:
                    co_occur[p] = co_occur.get(p, 0) + 1
    co_occurrence_recommendations = sorted(co_occur, key=co_occur.get, reverse=True)[:top_n]
    #Combinăm toate metodele
    hybrid_recommendations = list(set(co_occurrence_recommendations + content_recommendations))[:top_n]

    return hybrid_recommendations

def cart_view_recommendations(data, user_model, trainset, user_id, product_id, top_n=15):
    """ Recomandă produse relevante folosind ML (SVD) + conținut """

    #Filtrare pe bază de conținut (similaritate de produs)
    data["features"] = data[['category', 'subcategory', 'price']].apply(lambda x: ' '.join(x.astype(str)), axis=1)
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data["features"])
    cosine_sim = cosine_similarity(X, X)

    product_index = data[data['productId'] == product_id].index[0]
    similar_products = cosine_sim[product_index]
    similar_product_indices = similar_products.argsort()[-(top_n + 1):][::-1]
    content_recommendations = data.iloc[similar_product_indices]['productId'].tolist()

    #Recomandări bazate pe modelul SVD
    all_products = data['productId'].unique()
    predictions = []
    
    for pid in all_products:
        try:
            pred = user_model.predict(user_id, pid)
            predictions.append((pid, pred.est))
        except:
            continue

    predictions.sort(key=lambda x: x[1], reverse=True)
    svd_recommendations = [pid for pid, _ in predictions[:top_n]]

    #Combinăm toate metodele
    hybrid_recommendations = list(set(svd_recommendations + content_recommendations))[:top_n]

    return hybrid_recommendations
def favorite_view_recommendations(data, user_model, trainset, user_id, product_id, top_n=15):
    """ Recomandă produse relevante folosind ML (SVD) + co-ocurență """

    #Co-ocurență (produse cumpărate împreună)
    purchased_together = data[data['action'] == 'purchased'].groupby('userId')['productId'].apply(list)
    co_occur = {}
    for products in purchased_together:
        if product_id in products:
            for p in products:
                if p != product_id:
                    co_occur[p] = co_occur.get(p, 0) + 1
    co_occurrence_recommendations = sorted(co_occur, key=co_occur.get, reverse=True)[:top_n]

    #Recomandări bazate pe modelul SVD
    all_products = data['productId'].unique()
    predictions = []
    
    for pid in all_products:
        try:
            pred = user_model.predict(user_id, pid)
            predictions.append((pid, pred.est))
        except:
            continue

    predictions.sort(key=lambda x: x[1], reverse=True)
    svd_recommendations = [pid for pid, _ in predictions[:top_n]]

    #Combinăm toate metodele
    hybrid_recommendations = list(set(co_occurrence_recommendations + svd_recommendations))[:top_n]

    return hybrid_recommendations

def view_product(data, user_model, trainset, user_id, product_id, top_n=15):
    """ Recomandă produse relevante folosind ML (SVD) + co-ocurență """

    #Co-ocurență (produse cumpărate împreună)
    purchased_together = data[data['action'] == 'purchased'].groupby('userId')['productId'].apply(list)
    co_occur = {}
    for products in purchased_together:
        if product_id in products:
            for p in products:
                if p != product_id:
                    co_occur[p] = co_occur.get(p, 0) + 1
    co_occurrence_recommendations = sorted(co_occur, key=co_occur.get, reverse=True)[:top_n]

    #Filtrare pe bază de conținut (similaritate de produs)
    data["features"] = data[['category', 'subcategory', 'price']].apply(lambda x: ' '.join(x.astype(str)), axis=1)
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data["features"])
    cosine_sim = cosine_similarity(X, X)

    product_index = data[data['productId'] == product_id].index[0]
    similar_products = cosine_sim[product_index]
    similar_product_indices = similar_products.argsort()[-(top_n + 1):][::-1]
    content_recommendations = data.iloc[similar_product_indices]['productId'].tolist()


    #Combinăm toate metodele
    hybrid_recommendations = list(set(co_occurrence_recommendations + content_recommendations))[:top_n]

    return hybrid_recommendations

@app.route("/recommendations", methods=["GET"])
def get_recommendations():
    user_id = request.args.get('user_id')

    all_products = data['productId'].unique()
    predictions = [(pid, user_model.predict(user_id, pid).est) for pid in all_products]
    predictions.sort(key=lambda x: x[1], reverse=True)
    svd_recommendations = [pid for pid, _ in predictions[:20]]
    # Generăm recomandări pe bază de conținut
    content_recommendations = content_based_recommendations(data, svd_recommendations[0], top_n=20)
    
    # Combinăm recomandările
    hybrid_recommendations = list(set(svd_recommendations + content_recommendations))[:20]
    return jsonify({
        "user_id": user_id,
        "recommendations": hybrid_recommendations
    })

@app.route("/cart-recommendations", methods=["GET"])
def get_cart_recommendations():
    user_id = request.args.get('user_id')
    product_id = request.args.get('product_id')

    if not user_id or not product_id:
        return jsonify({"error": "Missing user_id or product_id"}), 400

    recommended_products = cart_recommendations(data, product_id, top_n=15)
    
    # Eliminăm produsul adăugat în coș din recomandări
    if product_id in recommended_products:
        recommended_products.remove(product_id)

    return jsonify({
        "user_id": user_id,
        "product_id": product_id,
        "recommended_products": recommended_products
    })

@app.route("/cart-view-recommendations", methods=["GET"])
def get_cart_view_recommendations():
    user_id = request.args.get('user_id')
    product_id = request.args.get('product_id')

    if not user_id or not product_id:
        return jsonify({"error": "Missing user_id or product_id"}), 400

    recommended_products = cart_view_recommendations(data, user_model, trainset, user_id, product_id, top_n=15)
    
    # Eliminăm produsul adăugat în coș din recomandări
    if product_id in recommended_products:
        recommended_products.remove(product_id)

    return jsonify({
        "user_id": user_id,
        "product_id": product_id,
        "recommended_products": recommended_products
    })
@app.route("/favorite-view-recommendations", methods=["GET"])
def get_favorite_recommendations():
    user_id = request.args.get('user_id')
    product_id = request.args.get('product_id')

    if not user_id or not product_id:
        return jsonify({"error": "Missing user_id or product_id"}), 400

    recommended_products = favorite_view_recommendations(data, user_model, trainset, user_id, product_id, top_n=15)
    
    # Eliminăm produsul adăugat în coș din recomandări
    if product_id in recommended_products:
        recommended_products.remove(product_id)

    return jsonify({
        "user_id": user_id,
        "product_id": product_id,
        "recommended_products": recommended_products
    })
@app.route("/view-product", methods=["GET"])
def get_view_recommendations():
    user_id = request.args.get('user_id')
    product_id = request.args.get('product_id')

    if not user_id or not product_id:
        return jsonify({"error": "Missing user_id or product_id"}), 400

    recommended_products = view_product(data, user_model, trainset, user_id, product_id, top_n=15)
    
    # Eliminăm produsul adăugat în coș din recomandări
    if product_id in recommended_products:
        recommended_products.remove(product_id)

    return jsonify({
        "user_id": user_id,
        "product_id": product_id,
        "recommended_products": recommended_products
    })
@app.route("/top15", methods=["GET"])
def get_top15_popular_products():
    data = pd.read_csv(data_file)
    purchased_data = data[data['action'] == 'purchased']
    popular_products = purchased_data.groupby(['productId']).size().reset_index(name='purchased')
    return jsonify(popular_products.head(15).to_dict(orient='records'))

if __name__ == "__main__":
    initialize_model()
    app.run(debug=True, port=5000)
