import requests
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
import uvicorn
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
from dotenv import load_dotenv
import os
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

app = FastAPI()
data = None
user_model = None
trainset = None
pred = None
new_products = []

def load_data_from_api():
    try:
        load_dotenv()
        API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3012")
        response = requests.get(f"{API_BASE_URL}/activities")
        response.raise_for_status()
        activities = response.json()
    except requests.RequestException as e:
        print(f"Error fetching data from API: {e}")
        return pd.DataFrame()

    df = pd.DataFrame(activities)
    action_to_rating = {
        "purchased": 5.0,
        "added_to_cart": 4.5,
        "added_to_favorite": 3.5,
        "viewed": 3.0
    }
    df['rating'] = df['action'].map(action_to_rating)
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')

    max_time = df['timestamp'].max()
    df['time_decay'] = (max_time - df['timestamp']).dt.days
    df['time_decay'] = np.exp(-df['time_decay'] / 30)

    scaler = StandardScaler()
    df['price'] = scaler.fit_transform(df[['price']])

    df['rating'] *= df['time_decay']
    df['rating'] += df.groupby(['userId', 'productId'])['action'].transform('count') * 0.5
    df['rating'] = df['rating'].clip(3, 5)

    return df

def train_svd_model(data):
    reader = Reader(rating_scale=(3, 5))
    dataset = Dataset.load_from_df(data[['userId', 'productId', 'rating']], reader)
    trainset = dataset.build_full_trainset()

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

    best_model = SVD(**gs.best_params['rmse'])
    best_model.fit(trainset)

    global pred
    testset = trainset.build_testset()
    pred = best_model.test(testset)
    return best_model, trainset

def initialize_model():
    global data, user_model, trainset, new_products
    print("Antrenare model ...")
    data = load_data_from_api()
    if data.empty:
        print("Nu s-au putut încărca datele pentru antrenarea modelului.")
        return

    reader = Reader(rating_scale=(3, 5))
    dataset = Dataset.load_from_df(data[['userId', 'productId', 'rating']], reader)
    trainset = dataset.build_full_trainset()
    user_model = SVD()
    user_model.fit(trainset)

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

    coefficients = np.polyfit(real_values, predicted_values, 1)
    regression_line = np.polyval(coefficients, real_values)

    plt.figure(figsize=(10, 6))
    plt.scatter(real_values, predicted_values, color='green', label='Valori prezise')
    plt.plot(real_values, regression_line, color='red', label='Linie de regresie', linewidth=2)
    plt.title("Grafic Valori Reale vs. Valori Prezise")
    plt.xlabel("Valori Reale")
    plt.ylabel("Valori Prezise")
    plt.legend()
    plt.grid(True)
    plt.show()

    new_products = identify_new_products(data, trainset)

def calculate_classification_metrics(real_values, predicted_values, threshold=3.5):
    pred_binary = [1 if pred >= threshold else 0 for pred in predicted_values]
    real_binary = [1 if real >= threshold else 0 for real in real_values]
    precision = precision_score(real_binary, pred_binary)
    recall = recall_score(real_binary, pred_binary)
    f1 = f1_score(real_binary, pred_binary)
    return precision, recall, f1

def identify_new_products(data, trainset):
    train_product_ids = set(trainset._raw2inner_id_items.keys())
    all_product_ids = set(data['productId'].unique())
    return list(all_product_ids - train_product_ids)

def cold_start_recommendations(data, new_products, top_n=10):
    if not new_products:
        return []

    data["features"] = data[['category', 'subcategory', 'price']].apply(lambda x: ' '.join(x.astype(str)), axis=1)
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data["features"])
    cosine_sim = cosine_similarity(X, X)

    new_indices = data[data['productId'].isin(new_products)].index
    sim_scores = cosine_sim[new_indices].mean(axis=0)
    top_indices = np.argsort(sim_scores)[-top_n:][::-1]

    return data.iloc[top_indices]['productId'].tolist()
#Funcția de filtrare pe bază de conținut
def content_based_recommendations(data, product_id, top_n=20):
    data["features"] = data[['category', 'subcategory', 'price']].apply(lambda x: ' '.join(x.astype(str)), axis=1)
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data["features"])
    cosine_sim = cosine_similarity(X, X)

    filtered = data[data['productId'] == product_id]
    if filtered.empty:
        return []

    product_index = filtered.index[0]
    similar_products = cosine_sim[product_index]
    similar_product_indices = similar_products.argsort()[-top_n:][::-1]
    recommended_products = data.iloc[similar_product_indices]['productId'].tolist()

    return recommended_products

def cart_recommendations(data, product_id, top_n=15):
    data["features"] = data[['category', 'subcategory', 'price']].apply(lambda x: ' '.join(x.astype(str)), axis=1)
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data["features"])
    cosine_sim = cosine_similarity(X, X)

    filtered = data[data['productId'] == product_id]
    if filtered.empty:
        return []

    product_index = filtered.index[0]
    similar_products = cosine_sim[product_index]
    similar_product_indices = similar_products.argsort()[-(top_n + 1):][::-1]
    content_recommendations = data.iloc[similar_product_indices]['productId'].tolist()

    purchased_together = data[data['action'] == 'purchased'].groupby('userId')['productId'].apply(list)
    co_occur = {}
    for products in purchased_together:
        if product_id in products:
            for p in products:
                if p != product_id:
                    co_occur[p] = co_occur.get(p, 0) + 1
    co_occurrence_recommendations = sorted(co_occur, key=co_occur.get, reverse=True)[:top_n]

    hybrid_recommendations = list(set(co_occurrence_recommendations + content_recommendations))[:top_n]

    return hybrid_recommendations


def cart_view_recommendations(data, user_model, trainset, user_id, product_id, top_n=15):
    if product_id not in data['productId'].values:
        return cold_start_recommendations(data, new_products, top_n=top_n)

    data["features"] = data[['category', 'subcategory', 'price']].apply(lambda x: ' '.join(x.astype(str)), axis=1)
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data["features"])
    cosine_sim = cosine_similarity(X, X)

    filtered = data[data['productId'] == product_id]
    product_index = filtered.index[0]
    similar_products = cosine_sim[product_index]
    similar_product_indices = similar_products.argsort()[-(top_n + 1):][::-1]
    content_recommendations = data.iloc[similar_product_indices]['productId'].tolist()

    all_products = data['productId'].unique()
    predictions = []

    for pid in all_products:
        if pid in trainset._raw2inner_id_items:
            pred = user_model.predict(user_id, pid)
            predictions.append((pid, pred.est))

    predictions.sort(key=lambda x: x[1], reverse=True)
    svd_recommendations = [pid for pid, _ in predictions[:top_n]]

    hybrid_recommendations = list(set(svd_recommendations + content_recommendations))[:top_n]

    return hybrid_recommendations

def favorite_view_recommendations(data, user_model, trainset, user_id, product_id, top_n=15):
    if product_id not in data['productId'].values:
        return cold_start_recommendations(data, new_products, top_n=top_n)

    purchased_together = data[data['action'] == 'purchased'].groupby('userId')['productId'].apply(list)
    co_occur = {}
    for products in purchased_together:
        if product_id in products:
            for p in products:
                if p != product_id:
                    co_occur[p] = co_occur.get(p, 0) + 1
    co_occurrence_recommendations = sorted(co_occur, key=co_occur.get, reverse=True)[:top_n]

    all_products = data['productId'].unique()
    predictions = []
    for pid in all_products:
        if pid in trainset._raw2inner_id_items:
            pred = user_model.predict(user_id, pid)
            predictions.append((pid, pred.est))

    predictions.sort(key=lambda x: x[1], reverse=True)
    svd_recommendations = [pid for pid, _ in predictions[:top_n]]

    hybrid_recommendations = list(set(co_occurrence_recommendations + svd_recommendations))[:top_n]

    return hybrid_recommendations

def view_product(data, user_model, trainset, user_id, product_id, top_n=15):
    if product_id not in data['productId'].values:
        return cold_start_recommendations(data, new_products, top_n=top_n)

    purchased_together = data[data['action'] == 'purchased'].groupby('userId')['productId'].apply(list)
    co_occur = {}
    for products in purchased_together:
        if product_id in products:
            for p in products:
                if p != product_id:
                    co_occur[p] = co_occur.get(p, 0) + 1
    co_occurrence_recommendations = sorted(co_occur, key=co_occur.get, reverse=True)[:top_n]

    data["features"] = data[['category', 'subcategory', 'price']].apply(lambda x: ' '.join(x.astype(str)), axis=1)
    vectorizer = TfidfVectorizer(stop_words='english')
    X = vectorizer.fit_transform(data["features"])
    cosine_sim = cosine_similarity(X, X)

    filtered = data[data['productId'] == product_id]
    product_index = filtered.index[0]
    similar_products = cosine_sim[product_index]
    similar_product_indices = similar_products.argsort()[-(top_n + 1):][::-1]
    content_recommendations = data.iloc[similar_product_indices]['productId'].tolist()

    hybrid_recommendations = list(set(co_occurrence_recommendations + content_recommendations))[:top_n]

    return hybrid_recommendations

@app.get("/recommendations")
def get_recommendations(user_id: str = Query(...)):
    all_products = data['productId'].unique()
    predictions = []
    for pid in all_products:
        if pid not in new_products and pid in trainset._raw2inner_id_items:
            pred = user_model.predict(user_id, pid)
            predictions.append((pid, pred.est))

    predictions.sort(key=lambda x: x[1], reverse=True)
    svd_recommendations = [pid for pid, _ in predictions[:15]]

    content_recommendations = content_based_recommendations(data, svd_recommendations[0], top_n=10) if svd_recommendations else []
    cold_start = cold_start_recommendations(data, new_products, top_n=5)

    hybrid_recommendations = list(set(svd_recommendations + content_recommendations + cold_start))[:20]

    return JSONResponse(content={
        "user_id": user_id,
        "recommendations": hybrid_recommendations
    })

@app.get("/cart-recommendations")
def get_cart_recommendations(
    user_id: str = Query(..., description="User ID"),
    product_id: str = Query(..., description="Product ID")
):
    recommended_products = cart_recommendations(data, product_id, top_n=15)

    if product_id in recommended_products:
        recommended_products.remove(product_id)

    cold_start = cold_start_recommendations(data, new_products, top_n=5)
    hybrid_recommendations = list(set(recommended_products + cold_start))[:20]

    return JSONResponse(content={
        "user_id": user_id,
        "product_id": product_id,
        "recommended_products": hybrid_recommendations
    })

@app.get("/cart-view-recommendations")
def get_cart_view_recommendations(
    user_id: str = Query(..., description="User ID"),
    product_id: str = Query(..., description="Product ID")
):
    recommended_products = cart_view_recommendations(data, user_model, trainset, user_id, product_id, top_n=15)

    if product_id in recommended_products:
        recommended_products.remove(product_id)
    cold_start = cold_start_recommendations(data, new_products, top_n=5)
    hybrid_recommendations = list(set(recommended_products + cold_start))[:20]

    return JSONResponse(content={
        "user_id": user_id,
        "product_id": product_id,
        "recommended_products": hybrid_recommendations
    })

@app.get("/favorite-view-recommendations")
def get_favorite_recommendations(
    user_id: str = Query(..., description="User ID"),
    product_id: str = Query(..., description="Product ID")
):
    recommended_products = favorite_view_recommendations(data, user_model, trainset, user_id, product_id, top_n=15)

    if product_id in recommended_products:
        recommended_products.remove(product_id)
    cold_start = cold_start_recommendations(data, new_products, top_n=5)
    hybrid_recommendations = list(set(recommended_products + cold_start))[:20]
    return JSONResponse(content={
        "user_id": user_id,
        "product_id": product_id,
        "recommended_products": hybrid_recommendations
    })

@app.get("/view-product")
def get_view_recommendations(
    user_id: str = Query(..., description="User ID"),
    product_id: str = Query(..., description="Product ID")
):
    recommended_products = view_product(data, user_model, trainset, user_id, product_id, top_n=15)

    if product_id in recommended_products:
        recommended_products.remove(product_id)
    cold_start = cold_start_recommendations(data, new_products, top_n=5)
    hybrid_recommendations = list(set(recommended_products + cold_start))[:20]
    return JSONResponse(content={
        "user_id": user_id,
        "product_id": product_id,
        "recommended_products": hybrid_recommendations
    })

@app.get("/top15")
def get_top15_popular_products():
    data = load_data_from_api()

    purchased_data = data[data['action'] == 'purchased']
    popular_products = purchased_data.groupby(['productId']).size().reset_index(name='purchased')
    
    return JSONResponse(content=popular_products.head(15).to_dict(orient='records'))
@app.get("/refresh-model")
def refresh_model():
    initialize_model()
    return JSONResponse(content={"status": "Model retrained successfully"})

initialize_model()
#Added scheduler for learning after 12 hours
scheduler = BackgroundScheduler()
scheduler.add_job(initialize_model, 'interval', hours=12)
scheduler.start()
atexit.register(lambda: scheduler.shutdown())
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000, reload=True)
