const form = document.querySelector('form');
const emailError = document.getElementById('emailError');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value;
    emailError.textContent = '';
    const forgotButton = document.getElementById('forgotButton');
    const buttonText = document.getElementById('buttonText');
    const spinner = document.getElementById('spinner');
    forgotButton.disabled = true;
    buttonText.classList.add('d-none');
    spinner.classList.remove('d-none');
    try{
        const res = await fetch('/forgot-password', {
            method: 'POST',
            body: JSON.stringify({email}),
            headers: {'Content-Type': 'application/json'}
        });
        const data = await res.json();
        if(data.error){
            emailError.textContent = data.error.email;
        }
        if(data.warning){
            emailError.textContent = data.warning;
        }
        if(data.message){
            emailError.style.color = '#06c906';
            emailError.textContent = data.message;
        }
    }catch(err){
        console.log(err);
    }finally {
        buttonText.classList.remove('d-none');
        spinner.classList.add('d-none');
        forgotButton.disabled = false;
      }  
})  