document.addEventListener('DOMContentLoaded', function() {
//Opens and close the adding address form
const closeButton = document.getElementById('close-form-add-address');
const addAddressContainer = document.getElementsByClassName('add-address-container')[0];
const navbar = document.getElementsByClassName('navbar')[0];
const footer = document.getElementsByClassName('footer')[0];
const mainContainer = document.getElementsByClassName('main-container')[0];
const warningMessage = document.getElementById('warningMessageAdd');
closeButton.addEventListener('click', () => {
    setTimeout(() => {
      mainContainer.style.opacity = '1';
        navbar.style.opacity = '1';
        footer.style.opacity = '1';
        addAddressContainer.style.display = 'none';
        warningMessage.textContent = '';
    }, 50); 
});
// //Adds address method
const addAddress = document.getElementById('add-address-form');
addAddress.addEventListener('submit', async(e) => {
    e.preventDefault();
    const name = addAddress.name.value;
    const phoneNumber = addAddress.phoneNumber.value;
    const street = addAddress.street.value;
    const city = addAddress.city.value;
    const country = addAddress.country.value;
    warningMessage.textContent = '';
    const saveButton = document.getElementById('saveButton');
    const buttonText = document.getElementById('buttonText-add');
    const spinner = document.getElementById('spinner-add');
    saveButton.disabled = true;
    buttonText.classList.add('d-none');
    spinner.classList.remove('d-none');
    try{
        const res = await fetch('/add-address', {
          method: 'POST',
          body: JSON.stringify({ name, phoneNumber, street, city, country}),
          headers: {'Content-Type': 'application/json'}
        });
        const data = await res.json();
        if(data.warning){
            warningMessage.textContent = data.warning;
        }
        if(data.msg){   
          window.location.reload();
         addAddress.style.display = 'none';
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
