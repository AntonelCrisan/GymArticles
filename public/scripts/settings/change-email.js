const form  = document.querySelector('form');
const emailError = document.getElementById('emailError');
const confEmailError = document.getElementById('confEmailError');
const errorFields = document.getElementById('errorFields');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const changeEmailButton = document.getElementById('changeEmailButton');
  const buttonText = document.getElementById('buttonText');
  const spinner = document.getElementById('spinner-change-email');
  changeEmailButton.disabled = true;
  buttonText.classList.add('d-none');
  spinner.classList.remove('d-none');
  const email = form.email.value;
  const confEmail = form.confEmail.value;
  const id = window.location.pathname.split('/').pop();
  emailError.textContent = '';
  confEmailError.textContent = '';
  errorFields.textContent = '';
  try{
    const res = await fetch(`/change-email/${id}`, {
      method: 'POST',
      body: JSON.stringify({email, confEmail}),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await res.json();
    
    if(data.errors){
      emailError.textContent = data.errors.email;
      passwordError.textContent = data.errors.password;
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
    changeEmailButton.disabled = false;
  }
});
