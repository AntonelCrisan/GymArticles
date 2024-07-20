const form  = document.querySelector('form');
const errorFields = document.getElementById('errorFields');
const resetSucces = document.getElementById('resetSuccess');
const formGroup = document.getElementById('formGroup');
resetSucces.style.display = 'none';
form.addEventListener('submit', async (e) => {
e.preventDefault();
const password = form.password.value;
const confPassword = form.confPassword.value;
errorFields.textContent = '';
const resetButton = document.getElementById('resetButton');
const buttonText = document.getElementById('buttonText');
const spinner = document.getElementById('spinner');
resetButton.disabled = true;
buttonText.classList.add('d-none');
spinner.classList.remove('d-none');
try{
    const token = window.location.pathname.split('/').pop();
    const res = await fetch(`/reset-password/${token}`, {
    method: 'POST', 
    body: JSON.stringify({password, confPassword}),
    headers: {'Content-Type': 'application/json'}
    });
    const data = await res.json();
    if(data.warning){
        errorFields.textContent = data.warning;
    }
    if(data.notEqual){
        errorFields.textContent = data.notEqual;
    }
    if(data.message === "Success"){
        formGroup.remove();
        resetButton.remove();
        resetSucces.style.display = 'block';
    }
}catch(err){
    console.error("Error at reseting password!");
}finally {
    buttonText.classList.remove('d-none');
    spinner.classList.add('d-none');
    resetButton.disabled = false;
  } 
})

//Show passwords
const showPassword = document.getElementById('showPassword');
const password = document.getElementById('password');
const confPassword = document.getElementById('confPassword');
showPassword.addEventListener('click', () => {
    if(password.type === 'password'){
        password.type = 'text';
        confPassword.type = 'text';
    }else{
        password.type = 'password';
        confPassword.type = 'password';
    }
});