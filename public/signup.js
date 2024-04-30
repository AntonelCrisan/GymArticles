const form  = document.querySelector('form');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const errorFields = document.getElementById('errorFields');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = form.name.value;
  const email = form.email.value;
  const password = form.password.value;
  nameError.textContent = '';
  emailError.textContent = '';
  passwordError.textContent = '';
  errorFields.textContent = '';
  try{
    const res = await fetch('/signup', {
      method: 'POST',
      body: JSON.stringify({name, email, password}),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await res.json();
    if(data.errors){
      nameError.textContent = data.errors.name;
      emailError.textContent = data.errors.email;
      passwordError.textContent = data.errors.password;
    }
    if(data.warning){
      errorFields.textContent = data.warning;
    }
    if(data.user){
      location.assign('/login');
    }
  }catch(err){
    console.log(err);
  }
})