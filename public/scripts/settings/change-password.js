const form  = document.querySelector('form');
const passwordError = document.getElementById('passwordError');
const confPasswordError = document.getElementById('confPasswordError');
const errorFields = document.getElementById('errorFields');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const changePasswordButton = document.getElementById('changePasswordButton');
  const buttonText = document.getElementById('buttonText');
  const spinner = document.getElementById('spinner-change-password');
  changePasswordButton.disabled = true;
  buttonText.classList.add('d-none');
  spinner.classList.remove('d-none');
  const password = form.password.value;
  const confPassword = form.confPassword.value;
  passwordError.textContent = '';
  confPasswordError.textContent = '';
  errorFields.textContent = '';
  try{
    const res = await fetch('/change-password', {
      method: 'POST',
      body: JSON.stringify({password, confPassword}),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await res.json();
    if(data.errors){
        passwordError.textContent = data.errors.password;
        confPasswordError.textContent = data.errors.confPassword;
    }
    if(data.warning){
      errorFields.textContent = data.warning;
    }
    if(data.success){
      location.assign('/settings');
    }
  }catch(err){
    console.error(err);
  }finally {
    buttonText.classList.remove('d-none');
    spinner.classList.add('d-none');
    changePasswordButton.disabled = false;
  }
});
