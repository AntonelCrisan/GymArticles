const form = document.querySelector('form');
const emailError = document.getElementById('emailError');
const emailSuccess = document.getElementById('emailSuccess');
emailSuccess.style.display = 'none';
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
        if(data.message === "Success"){
            emailSuccess.style.display = 'block';
            document.getElementById('emailLabel').remove();
            document.getElementById('email').remove();
            document.getElementById('emailError').remove();
            document.getElementById('forgotButton').remove();
        }
    }catch(err){
        console.log(err);
    }finally {
        buttonText.classList.remove('d-none');
        spinner.classList.add('d-none');
        forgotButton.disabled = false;
      }  
})  