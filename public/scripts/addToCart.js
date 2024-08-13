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
        console.log(cart.dataset);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = await response.json();
        if (result.success) {
            return result.newCartCount; // Return the new favorite count
        } else {
            console.error('Failed to update favorite status.');
            return null;
        }
    } catch (error) {
        console.error('Error updating favorite status:', error);
        return null;
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
});
