import pandas as pd
from surprise import Dataset, Reader, SVD, KNNBasic
from surprise.model_selection import train_test_split, GridSearchCV
from surprise import accuracy
from data_loader import load_data
import json
import sys
import os


def top15_popular_products(file_path):
    # Citim datele din fișierul CSV
    data = pd.read_csv(file_path)

    # Filtrăm datele doar pentru produsele cumpărate
    purchased_data = data[data['action'] == 'purchased']

    # Grupăm produsele după 'productName' și numărăm de câte ori au fost cumpărate
    popular_products = purchased_data.groupby('productName').size().reset_index(name='purchase_count')

    # Sortăm descrescător după numărul de achiziții
    popular_products = popular_products.sort_values(by='purchase_count', ascending=False)

    # Selectăm doar primele 15 produse
    top15 = popular_products.head(15)

    return top15
def train_user_based_model(data):
    """
    Antrenăm un model User-Based Collaborative Filtering folosind biblioteca Surprise.
    :param data: DataFrame Pandas cu datele utilizatorilor și produselor.
    :return: Un model antrenat Surprise și trainset.
    """
    reader = Reader(rating_scale=(1, 3))
    dataset = Dataset.load_from_df(data[['userId', 'productId', 'rating']], reader)

    trainset, testset = train_test_split(dataset, test_size=0.2)

    sim_options = {
        "name": "cosine",
        "user_based": True  # User-based Collaborative Filtering
    }

    model = KNNBasic(sim_options=sim_options)
    model.fit(trainset)

    return model, trainset, testset

def get_user_recommendations(model, trainset, user_id):
    """
    Recomandăm produse pentru un utilizator specific folosind User-Based Collaborative Filtering.
    :param model: Modelul antrenat.
    :param trainset: Setul de antrenament Surprise.
    :param user_id: ID-ul utilizatorului.
    :return: Produse recomandate.
    """
    try:
        inner_user_id = trainset.to_inner_uid(user_id)
    except ValueError:
        return {"error": "User ID not found in dataset"}

    # Vecinii cei mai apropiați (utilizatori similari)
    neighbors = model.get_neighbors(inner_user_id, k=5)

    # Produse recomandate de la vecinii apropiați
    recommendations = []
    for neighbor in neighbors:
        raw_user_id = trainset.to_raw_uid(neighbor)
        recommendations.append(f"Recommended products for user {raw_user_id}")

    return recommendations

def recommend_complementary_products(data, product_id):
    """
    Recomandă produse complementare bazate pe categorie/subcategorie și exclud duplicatele.
    :param data: DataFrame Pandas cu toate produsele.
    :param product_id: ID-ul produsului cumpărat/adăugat.
    :return: Produse complementare recomandate.
    """
    # Găsim produsul principal
    product = data[data['productId'] == product_id]
    if product.empty:
        return {"error": "Product ID not found in dataset"}

    # Extragem informațiile produsului
    category = product['category'].iloc[0]
    subcategory = product['subcategory'].iloc[0]
    product_name = product['productName'].iloc[0]

    # Filtrăm produse din alte subcategorii (complementare)
    complementary_products = data[
        (data['category'] != category) &
        (data['subcategory'] != subcategory) &
        (data['productName'] != product_name)
    ]

    # Evităm produse duplicate prin ID sau nume (opțional)
    complementary_products = complementary_products.drop_duplicates(subset=['productId', 'productName'])

    # Selectăm aleatoriu 5 produse complementare
    recommended = complementary_products.sample(n=min(10, len(complementary_products)))

    return recommended[['productId', 'productName', 'category', 'subcategory']].to_dict(orient='records')

def optimize_svd(data):
    """
    Optimizăm parametrii modelului SVD folosind GridSearchCV.
    :param data: DataFrame Pandas cu datele utilizatorilor și produselor.
    :return: Modelul SVD optimizat și performanța acestuia.
    """
    reader = Reader(rating_scale=(1, 3))
    dataset = Dataset.load_from_df(data[['userId', 'productId', 'rating']], reader)

    param_grid = {
        'n_factors': [20, 50, 100],
        'lr_all': [0.002, 0.005, 0.01],
        'reg_all': [0.02, 0.05, 0.1]
    }

    gs = GridSearchCV(SVD, param_grid, measures=['rmse', 'mae'], cv=3)
    gs.fit(dataset)

    best_model = gs.best_estimator['rmse']
    return best_model, gs.best_score['rmse'], gs.best_params['rmse']

def main():
    if len(sys.argv) != 4:
        print("Usage: python recommender.py <user_id> <product_id> <filter_type>")
        print("<filter_type> poate fi 'strict' sau 'weighted'.")
        sys.exit(1)

    user_id = sys.argv[1]
    product_id = sys.argv[2]
    filter_type = sys.argv[3].lower()

    # Alegem metoda de filtrare
    if filter_type == "strict":
        filter_purchases_only = True
    elif filter_type == "weighted":
        filter_purchases_only = False
    else:
        print("Invalid filter_type. Folosește 'strict' sau 'weighted'.")
        sys.exit(1)

    # Încărcăm datele cu metoda aleasă
    file_path = os.path.join(os.path.dirname(__file__), "recomandations.csv")
    data = load_data(file_path, filter_purchases_only=filter_purchases_only)
    top15 = top15_popular_products(file_path)
    print(top15)
    if user_id not in data['userId'].values:
        print(json.dumps({"error": f"User ID {user_id} not found in dataset."}, indent=4))
        sys.exit(1)

    if product_id not in data['productId'].values:
        print(json.dumps({"error": f"Product ID {product_id} not found in dataset."}, indent=4))
        sys.exit(1)

    # Antrenăm modelul User-Based
    user_model, trainset, testset = train_user_based_model(data)

    # Obținem recomandări pentru utilizator
    recommendations = get_user_recommendations(user_model, trainset, user_id)

    # Obținem recomandări complementare pentru produs
    complementary = recommend_complementary_products(data, product_id)

    # Optimizăm și evaluăm modelul SVD
    svd_model, best_rmse, best_params = optimize_svd(data)
    # Afișăm rezultatele într-un format JSON
    print(json.dumps({
        "filter_type": filter_type,
        "user_id": user_id,
        "recommendations": recommendations,
        "complementary": complementary,
        "svd_optimization": {
            "best_rmse": best_rmse,
            "best_params": best_params
        }
    }, indent=4))

if __name__ == "__main__":
    main()