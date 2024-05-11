const form = document.querySelector('form');
const emailError = document.getElementById('emailError');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value;
    emailError.textContent = '';
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
        if(data.user){
        location.assign('/reset-password');
        }
    }catch(err){
        console.log(err);
    }    
})  