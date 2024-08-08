function showAddedMessage(){
    const message = document.getElementById('added-favorite');
    message.classList.remove('d-none');
    //Close message
    setTimeout(() => {
        message.classList.add('hide');
        setTimeout(() => {
            message.classList.add('d-none');
            message.classList.remove('hide');
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
        }, 1000);
    }, 1500);
}
const addFavorite = document.querySelectorAll('#addFavorite');
addFavorite.forEach(favorite => {
    favorite.addEventListener('click', () => {
        if(favorite.classList.contains('clicked')){
            favorite.classList.remove('clicked');
            showRemovedMessage();
        }else{
            favorite.classList.add('clicked');
            showAddedMessage();
        }
    });
});