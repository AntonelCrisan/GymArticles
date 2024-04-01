let eroare = document.getElementById("eroareLogin");
let email = document.getElementById('email').value;
let password = document.getElementById('password').value;
const btnLogin = document.getElementById('btnLogin');
btnLogin.addEventListener('click', () => {
    if(email === "" && password === "") { 
        eroare.innerHTML = 'All fields  must be filled out';
    }
});