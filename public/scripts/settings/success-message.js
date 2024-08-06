const message = document.getElementById('success-message');
function showSuccessMessage(){
    message.classList.remove('d-none');
    //Close message
    setTimeout(() => {
        message.classList.add('hide');
        setTimeout(() => {
            message.classList.add('d-none');
            message.classList.remove('hide');
            location.reload();
        }, 5000);
    }, 7000);
}
if (message && message.classList.contains('d-none')) {
  showSuccessMessage();
}