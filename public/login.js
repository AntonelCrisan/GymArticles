const form  = document.querySelector('form');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const errorFields = document.getElementById('errorFields');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginButton = document.getElementById('loginButton');
    const buttonText = document.getElementById('buttonText');
    const spinner = document.getElementById('spinner');
    loginButton.disabled = true;
    buttonText.classList.add('d-none');
    spinner.classList.remove('d-none');
    const email = form.email.value;
    const password = form.password.value;
    emailError.textContent = '';
    passwordError.textContent = '';
    errorFields.textContent = '';
    
    try{
      const res = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify({email, password}),
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
      if(data.user){
        console.log(data.user);
        location.assign('/');
      }
    }catch(err){
      console.error(err);
    }finally {
      buttonText.classList.remove('d-none');
      spinner.classList.add('d-none');
      loginButton.disabled = false;
    }
  })