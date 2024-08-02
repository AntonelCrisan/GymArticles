const cancelButton = document.getElementById('cancelButton');
const deleteAddressButton = document.querySelectorAll('.deleteAddressButton');
const delete_address = document.getElementsByClassName('delete-address')[0];
const navbar = document.getElementsByClassName('navbar')[0];
const containerAccount = document.getElementsByClassName('container-account')[0];
cancelButton.addEventListener('click', () => {
    setTimeout(() => {
        containerAccount.style.opacity = '1';
        navbar.style.opacity = '1';
        delete_address.style.display = 'none';
    }, 50); 
});
deleteAddressButton.forEach(button => {
    button.addEventListener('click', () => {
        delete_address.style.display = 'block';
        setTimeout(() => {
            navbar.style.opacity = '0.2';
            containerAccount.style.opacity = '0.2';
            delete_address.style.opacity = '1';
        }, 10); 
    });
});
