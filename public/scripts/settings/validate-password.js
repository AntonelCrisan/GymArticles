const form  = document.querySelector('form');
const passwordError = document.getElementById('passwordError');
const errorFields = document.getElementById('errorFields');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const validatePasswordButton = document.getElementById('validatePasswordButton');
  const buttonText = document.getElementById('buttonText');
  const spinner = document.getElementById('spinner-validate-password');
  validatePasswordButton.disabled = true;
  buttonText.classList.add('d-none');
  spinner.classList.remove('d-none');
  const password = form.password.value;
  passwordError.textContent = '';
  errorFields.textContent = '';
  const intendedUrl = document.getElementById('intendedUrl').value;
  try{
    const res = await fetch('/validate-password', {
      method: 'POST',
      body: JSON.stringify({password, intendedUrl}),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await res.json();
    
    if(data.errors){
      passwordError.textContent = data.errors.password;
    }
    if(data.warning){
      errorFields.textContent = data.warning;
    }
    if(data.valid){
      location.assign(data.intendedUrl);
    }
  }catch(err){
    console.error(err);
  }finally {
    buttonText.classList.remove('d-none');
    spinner.classList.add('d-none');
    validatePasswordButton.disabled = false;
  }
});