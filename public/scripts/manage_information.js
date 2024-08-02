// Opens and closes manage information form and changes opacity between manage information form and user account page
const closeInformation = document.getElementById('close-information');
const manageInformation = document.getElementById('manage-information');
const container = document.getElementsByClassName('container-information')[0];
const navbar = document.getElementsByClassName('navbar')[0];
const containerAccount = document.getElementsByClassName('container-account')[0];
const footer = document.getElementsByClassName('footer')[0];
closeInformation.addEventListener('click', () => {
    setTimeout(() => {
        containerAccount.style.opacity = '1';
        navbar.style.opacity = '1';
        container.style.display = 'none';
        footer.style.opacity = '1';
    }, 50); 
});

manageInformation.addEventListener('click', () => {
    container.style.display = 'block';
    setTimeout(() => {
        containerAccount.style.opacity = '0.2';
        navbar.style.opacity = '0.2';
        container.style.opacity = '1';
        footer.style.opacity = '0.2';
    }, 10); 
});
//Populate Date of Birth
//Populate day option
const daySelect = document.getElementById('day');
for(let i = 1; i <= 31; i++){
    let option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    daySelect.appendChild(option);
};
//Populate month option
const monthSelect = document.getElementById('month');
const months = ["Ianuary", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
for(let i = 0; i <= 12; i++){
    let option = document.createElement('option');
    option.value = months[i];
    option.textContent = months[i];
    monthSelect.appendChild(option);
};

//Populate year option
const yearSelect = document.getElementById('year');
for(let i = 2014; i >= 1920; i--){
    let option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    yearSelect.appendChild(option);
}
function showSuccessMessage() {
    const message = document.getElementById('success-message');
    message.classList.remove('d-none');
    //Close message
    setTimeout(() => {
        message.classList.add('hide');
        setTimeout(() => {
            message.classList.add('d-none');
            message.classList.remove('hide');
            location.reload();
        }, 500);
    }, 3000);
}
document.addEventListener('DOMContentLoaded', () => {
const form  = document.getElementById('form');
const warningMessage = document.getElementById('warningMessage');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const saveButton = document.getElementById('saveButton');
  const buttonText = document.getElementById('buttonText');
  const spinner = document.getElementById('spinner');
  saveButton.disabled = true;
  buttonText.classList.add('d-none');
  spinner.classList.remove('d-none');
  const nameUser = form.nameUser.value;
  const phoneNumber = form.phoneNumber.value;
  const year = form.year.value;
  const month = form.month.value;
  const day = form.day.value;
  warningMessage.textContent = '';
  try{
    const res = await fetch('/manage-information', {
      method: 'POST',
      body: JSON.stringify({nameUser, phoneNumber, year, month, day}),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await res.json();
    if(data.warning){
        warningMessage.textContent = data.warning;
    }
    if(data.message){   
        setTimeout(() => {
            containerAccount.style.opacity = '1';
            navbar.style.opacity = '1';
            container.style.display = 'none';
            showSuccessMessage();
        }, 50); 
    }
  }catch(err){
    console.log(err);
  }finally {
    buttonText.classList.remove('d-none');
    spinner.classList.add('d-none');
    saveButton.disabled = false;
  }
});
});
