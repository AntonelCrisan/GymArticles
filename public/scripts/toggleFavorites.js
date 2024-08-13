document.addEventListener('DOMContentLoaded', () => {
    function showAddedMessage() {
        const message = document.getElementById('added-favorite');
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

    function showRemovedMessage() {
        const message = document.getElementById('removed-favorite');
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

    async function updateFavoriteStatus(heart, isAdding) {
        try {
            const response = await fetch('/addFavorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: heart.dataset.productId,
                    isAdding: isAdding
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const result = await response.json();
            if (result.success) {
                return result.newFavoriteCount; // Return the new favorite count
            } else {
                console.error('Failed to update favorite status.');
                return null;
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
            window.location.assign('/login');
            return null;
        }
    }

    const addFavorite = document.querySelectorAll('#addFavorite');
    const favoriteCountElement = document.getElementById('favorite-count');
    const currentCount = parseInt(favoriteCountElement.textContent, 10);
    if (currentCount === 0) {
        favoriteCountElement.style.display = 'none'; // Hide if count is zero
    }else{
        favoriteCountElement.style.display = 'flex'; // Hide if count is zero
    }
    addFavorite.forEach(favorite => {
        favorite.addEventListener('click', async () => {
            const isAdding = !favorite.classList.contains('clicked');
            if (isAdding) {
                favorite.classList.add('clicked');
                showAddedMessage();
            } else {
                favorite.classList.remove('clicked');
                showRemovedMessage();
            }

            const newFavoriteCount = await updateFavoriteStatus(favorite, isAdding);
            if (favoriteCountElement) {
                if (newFavoriteCount > 0) {
                    favoriteCountElement.textContent = newFavoriteCount;
                    favoriteCountElement.style.display = 'flex'; // Ensure it's visible
                } else {
                    favoriteCountElement.style.display = 'none'; // Hide if count is zero
                }
            } else {
                console.error('Favorite count element not found.');
            }
        });
    });
});
