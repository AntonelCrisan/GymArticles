document.addEventListener('DOMContentLoaded', () => {
    async function updateFavoriteStatus(cart) {
        try {
            const response = await fetch('/addToCart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',  // send cookies
                body: JSON.stringify({
                    productId: cart.dataset.productId
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const result = await response.json();
            if (result.success) {
                return result.newCartCount;
            } else {
                console.error('Failed to update cart status.');
                showWarningOutOfStock();
                return null;
            }
        } catch (error) {
            console.error('Error updating cart status:', error);
            window.location.assign('/login');
        }
    }

    const addToCart = document.querySelectorAll('#addToCartButton');
    const cartCountElement = document.getElementById('cart-count');

    if (cartCountElement) {
        const currentCount = parseInt(cartCountElement.textContent, 10);
        cartCountElement.style.display = currentCount === 0 ? 'none' : 'flex';
    }

    addToCart.forEach(cart => {
        cart.addEventListener('click', async () => {
            const newCartCount = await updateFavoriteStatus(cart);
            if (cartCountElement) {
                if (newCartCount > 0) {
                    cart.classList.remove('clicked');
                    void cart.offsetWidth; 
                    cart.classList.add('clicked');
                    showAddedCartMessage();
                    cartCountElement.textContent = newCartCount;
                    cartCountElement.style.display = 'flex';
                } else {
                    cartCountElement.style.display = 'none';
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
       function showAddedCartMessage() {
        const message = document.getElementById('added-cart');
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
});
