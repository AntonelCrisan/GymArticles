import pandas as pd
import os
def load_data(file_path, filter_purchases_only=False):
    """
    Încărcăm și procesăm datele pentru sistemul de recomandare.
    :param file_path: Calea către fișierul CSV.
    :param filter_purchases_only: Dacă True, filtrează doar produsele cumpărate.
    :return: DataFrame Pandas procesat.
    """
    # Mapăm acțiunile în rating-uri
    action_to_rating = {
        "purchased": 3,
        "added_to_cart": 2,
        "added_to_favorite": 1
    }

    # Încărcăm datele
    data = pd.read_csv(file_path)

    # Dacă este activată filtrarea strictă, păstrăm doar produsele cumpărate
    if filter_purchases_only:
        data = data[data['action'] == "purchased"]

    # Mapăm acțiunile la rating-uri
    data['rating'] = data['action'].map(action_to_rating)
    # Filtrăm utilizatori și produse cu prea puține interacțiuni
    user_counts = data['userId'].value_counts()
    product_counts = data['productId'].value_counts()

    filtered_data = data[
        data['userId'].isin(user_counts[user_counts > 1].index) &
        data['productId'].isin(product_counts[product_counts > 1].index)
    ]

    return filtered_data

# Testarea funcției
if __name__ == "__main__":
    file_path = os.path.join(os.path.dirname(__file__), "recomandations.csv")

    print("Date cu toate acțiunile:")
    data_all = load_data(file_path, filter_purchases_only=False)
    print(data_all.head())

    print("\nDate doar cu produsele cumpărate:")
    data_purchased = load_data(file_path, filter_purchases_only=True)
    print(data_purchased.head())
