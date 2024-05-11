const form  = document.querySelector('form');
const errorFields = document.getElementById('errorFields');
form.addEventListener('submit', async (e) => {
e.preventDefault();
const password = form.password.value;
const confPassword = form.confPassword.value;
errorFields.textContent = '';
try{
    const res = await fetch('/reset-password', {
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
}
})