const form  = document.querySelector('form');
const errorFields = document.getElementById('errorFields');
form.addEventListener('submit', async (e) => {
e.preventDefault();
const password = form.password.value;
const confPassword = form.confPassword.value;
errorFields.textContent = '';
const resetButton = document.getElementById('resetButton');
const buttonText = document.getElementById('buttonText');
const spinner = document.getElementById('spinner');
const token = "<%= token %>";
console.log(token);
resetButton.disabled = true;
buttonText.classList.add('d-none');
spinner.classList.remove('d-none');
try{
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
}catch(err){
    console.error(err);
}finally {
    buttonText.classList.remove('d-none');
    spinner.classList.add('d-none');
    forgotButton.disabled = false;
  } 
})