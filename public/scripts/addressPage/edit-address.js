//Opens and closes editing address form
const cancelButtonEdit = document.getElementById('close-button-edit');
const editAddressButton = document.querySelectorAll('.editAddressButton');
const editAddressContainer = document.getElementsByClassName('edit-address-container')[0];
const warningMsg = document.getElementById('warningMessageEdit');
cancelButtonEdit.addEventListener('click', () => {
    setTimeout(() => {
        containerAccount.style.opacity = '1';
        navbar.style.opacity = '1';
        footer.style.opacity = '1';
        editAddressContainer.style.display = 'none';
        warningMsg.textContent = '';
    }, 50); 
});
document.addEventListener('DOMContentLoaded', () => {
    //Gets all inputs
    const nameInput = document.getElementById('name-edit');
    const phoneInput = document.getElementById('phone-edit');
    const streetInput = document.getElementById('street-edit');
    const cityInput = document.getElementById('city-edit');
    const countryInput = document.getElementById('country-edit');
    editAddressButton.forEach(button => {
        button.addEventListener('click', (e) => {
            //Gets all the current address information
            const addressItem = e.target.closest('.address-item');
            const name = addressItem.getAttribute('data-name');
            const phone = addressItem.getAttribute('data-phone');
            const street = addressItem.getAttribute('data-street');
            const city = addressItem.getAttribute('data-city');
            const country = addressItem.getAttribute('data-country');
            //Fill the current adddress information
            nameInput.value = name;
            phoneInput.value = phone;
            streetInput.value = street;
            cityInput.value = city;
            countryInput.value = country;
            editAddressContainer.style.display = 'block';
            setTimeout(() => {
                navbar.style.opacity = '0.2';
                containerAccount.style.opacity = '0.2';
                footer.style.opacity = '0.2';
                editAddressContainer.style.opacity = '1';
            }, 10); 
        });
});
});
//Edit address method
editAddressButton.forEach(button => {
    const editAddressForm = document.getElementById('edit-address-form');
    button.addEventListener('click', () => {
    const id = button.getAttribute('data-id');
    editAddressForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        const saveButton = document.getElementById('saveButton');
        const buttonText = document.getElementById('buttonText-edit');
        const spinner = document.getElementById('spinner-edit');
        saveButton.disabled = true;
        buttonText.classList.add('d-none');
        spinner.classList.remove('d-none');
        const name = editAddressForm.name.value;
        const phoneNumber = editAddressForm.phoneNumber.value;
        const street = editAddressForm.street.value;
        const city = editAddressForm.city.value;
        const country = editAddressForm.country.value;
        warningMsg.textContent = '';
        try{
            const res = await fetch(`/update-address/${id}`, {
                method: 'POST',
                body: JSON.stringify({name, phoneNumber, street, city, country}),
                headers: {'Content-Type': 'application/json'}
            });
            const data = await res.json();
            if(data.warning){
                warningMsg.textContent = data.warning;
            }
            if(data.message){   
                window.location.reload();
                addAddress.style.display = 'none';
            }
            }catch(err){
                console.log('Error:', err);
                warningMsg.textContent = 'An error occurred. Please try again later.';
            }finally {
                buttonText.classList.remove('d-none');
                spinner.classList.add('d-none');
                saveButton.disabled = false;
            }
        });
    });
});
