document.addEventListener('DOMContentLoaded', () => {
async function updateFavoriteStatus(cart) {
    try {
        const response = await fetch('/addToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: cart.dataset.productId
            })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = await response.json();
        if (result.success) {
            // fetchRecommendations(result.products)
            return result.newCartCount; // Return the new favorite count
        }else {
            console.error('Failed to update favorite status.');
            showWarningOutOfStock();
            return null;
        }
    } catch (error) {
        console.error('Error updating favorite status:', error);
        window.location.assign('/login');
    }
}

const addToCart = document.querySelectorAll('#addToCartButton');
const cartCountElement = document.getElementById('cart-count');
const currentCount = parseInt(cartCountElement.textContent, 10);
if (currentCount === 0) {
    cartCountElement.style.display = 'none'; // Hide if count is zero
}else{
    cartCountElement.style.display = 'flex'; // Hide if count is zero
}
addToCart.forEach(cart => {
    cart.addEventListener('click', async () => {
        const newCartCount = await updateFavoriteStatus(cart);
        if (cartCountElement) {
            if (newCartCount > 0) {
                cartCountElement.textContent = newCartCount;
                cartCountElement.style.display = 'flex'; // Ensure it's visible
            } else {
                cartCountElement.style.display = 'none'; // Hide if count is zero
            }
        } else {
            console.error('Cart count element not found.');
            
        }
    });
});
function showWarningOutOfStock() {
    const message = document.getElementById('product-outof-stock');
    if (message) {
        message.classList.remove('d-none');
        setTimeout(() => {
            message.classList.add('hide');
            setTimeout(() => {
                message.classList.add('d-none');
                message.classList.remove('hide');
            }, 1000);
        }, 1500);
    }
}
function fetchRecommendations(products) {
    const recommendations = document.querySelector('#modal-body-recommendations');
    recommendations.innerHTML = `<div class="row"></div>`; // Resetăm și creăm un container de tip grid
    
    const row = recommendations.querySelector('.row');

    products.forEach(product => {
        row.innerHTML += `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <a href="/product?name=${product.name}&id=${product._id}" class="article">
                            <img src="${product.image}" alt="img" class="img-fluid" style="max-height: 200px; object-fit: cover;">
                            <h5 class="card-title mt-2 text-truncate">${product.name}</h5>
                        </a>
                        <ul class="rating list-unstyled">
                            <span class="fa fa-star checked"></span>
                            <span class="fa fa-star checked"></span>
                            <span class="fa fa-star checked"></span>
                            <span class="fa fa-star checked"></span>
                            <span class="fa fa-star"></span>
                        </ul>
                        <p class="fw-bold">${product.price}$</p>
                        <button class="btn btn-primary w-100" id="addToCartButton" data-product-id="${product._id}">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#ffffff">
                                    <path d="M466.43-615.63v-123h-124v-60h124v-123h60v123h123v60h-123v123h-60ZM289.79-77.37Q260-77.37 239-98.58t-21-51q0-29.79 21.21-50.79t51-21q29.79 0 50.79 21.21 21 21.22 21 51 0 29.79-21.21 50.79t-51 21Zm404 0Q664-77.37 643-98.58t-21-51q0-29.79 21.21-50.79t51-21q29.79 0 50.79 21.21 21 21.22 21 51 0 29.79-21.21 50.79t-51 21Zm-634.42-740v-65.26h120.54L348.48-521.5h286.99l158.86-277.13h73.45l-162.95 304.2q-11.48 19.47-29.51 31.45Q657.3-451 635.4-451H334.11l-54.33 101.37h488.85v65.26H284q-39.34 0-59.72-31.31-20.39-31.32-2.67-63.75L284.89-496 138.33-817.37H59.37Z"/>
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}
});
