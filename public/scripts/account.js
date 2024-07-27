// Opens and closes manage information form and changes opacity between manage information form and user account page
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
        containerAccount.style.opacity = '0.2';
        navbar.style.opacity = '0.2';
        container.style.opacity = '1';
    }, 10); 
});

//Changes color of links from sidebar when user click on of them 
const links = document.querySelectorAll('.sidebar-link');
links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        links.forEach(link => {
            link.classList.remove('active');
        });
        link.classList.add('active');
    });
});

//Populate Date of Birth
//Populate day option
const daySelect = document.getElementById('day');
for(let i = 1; i <= 31; i++){
    let option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    daySelect.appendChild(option);
};
//Populate month option
const monthSelect = document.getElementById('month');
const months = ["Ianuary", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
for(let i = 0; i <= 12; i++){
    let option = document.createElement('option');
    option.value = months[i];
    option.textContent = months[i];
    monthSelect.appendChild(option);
};

//Populate year option
const yearSelect = document.getElementById('year');
for(let i = 2014; i >= 1920; i--){
    let option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    yearSelect.appendChild(option);
}