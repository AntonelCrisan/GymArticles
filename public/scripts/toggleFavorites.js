document.addEventListener('DOMContentLoaded', () => {
    function showAddedMessage(){
        const message = document.getElementById('added-favorite');
        message.classList.remove('d-none');
        //Close message
        setTimeout(() => {
            message.classList.add('hide');
            setTimeout(() => {
                message.classList.add('d-none');
                message.classList.remove('hide');
                window.location.reload();
            }, 1000);
        }, 1500);
    }
    function showRemovedMessage(){
        const message = document.getElementById('removed-favorite');
        message.classList.remove('d-none');
        //Close message
        setTimeout(() => {
            message.classList.add('hide');
            setTimeout(() => {
                message.classList.add('d-none');
                message.classList.remove('hide');
                window.location.reload();
            }, 1000);
        }, 1500);
    }
    async function updateFavoriteStatus(heart, isAdding) {
        try {
            const response = await fetch('/updateFavorite', {
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
                console.log('Favorite status updated successfully.');
            } else {
                console.error('Failed to update favorite status.');
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
        }
    }
const addFavorite = document.querySelectorAll('#addFavorite');
addFavorite.forEach(favorite => {
    favorite.addEventListener('click', async() => {
        const isAdding = !favorite.classList.contains('clicked');
        const productId = favorite.dataset.productId;
        console.log(productId);
        if(isAdding){
            favorite.classList.add('clicked');
            showAddedMessage();
            await updateFavoriteStatus(favorite, true);
        }else{
            favorite.classList.remove('clicked');
            showRemovedMessage();
            await updateFavoriteStatus(favorite, false);
        }
    });
});
});
