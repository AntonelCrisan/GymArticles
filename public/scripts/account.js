const closeInformation = document.getElementById('close-information');
const manageInformation = document.getElementById('manage-information');
const container = document.getElementsByClassName('container-information')[0];
const navbar = document.getElementsByClassName('navbar')[0];
const containerAccount = document.getElementsByClassName('container-account')[0];
closeInformation.addEventListener('click', () => {
    setTimeout(() => {
        containerAccount.style.opacity = '1';
        navbar.style.opacity = '1';
        container.style.display = 'none';
    }, 50); 
});

manageInformation.addEventListener('click', () => {
    container.style.display = 'block';
    setTimeout(() => {
        containerAccount.style.opacity = '0.5';
        navbar.style.opacity = '0.5';
        container.style.opacity = '1';
    }, 10); 
});