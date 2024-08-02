//Open and close delete address container
const cancelButton = document.getElementById('cancelButton');
const deleteAddressButton = document.querySelectorAll('.deleteAddressButton');
const delete_address = document.getElementsByClassName('delete-address')[0];
const navbar = document.getElementsByClassName('navbar')[0];
const containerAccount = document.getElementsByClassName('container-account')[0];
const footer = document.getElementsByClassName('footer')[0];
cancelButton.addEventListener('click', () => {
    setTimeout(() => {
        containerAccount.style.opacity = '1';
        navbar.style.opacity = '1';
        footer.style.opacity = '1';
        delete_address.style.display = 'none';
    }, 50); 
});
deleteAddressButton.forEach(button => {
    button.addEventListener('click', () => {
        delete_address.style.display = 'block';
        setTimeout(() => {
            navbar.style.opacity = '0.2';
            containerAccount.style.opacity = '0.2';
            footer.style.opacity = '0.2';
            delete_address.style.opacity = '1';
        }, 10); 
    });
});

deleteAddressButton.forEach(button => {
    button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const deleteAddress = document.getElementById('deleteButton');
        deleteAddress.addEventListener('click', async(e)=> {
            e.preventDefault();
            try {
                const response = await fetch(`/delete-address/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                if(result.message === 'Address deleted succesfully'){
                    window.location.reload();
                }
            } catch (error) {
                console.log(error);
            }
        }) 
    });
    });
    const closeButton = document.getElementById('close-button');
    const addAddressButton = document.querySelectorAll('#add-address-btn');
    const addAddressContainer = document.getElementsByClassName('add-address-container')[0];
    const warningMessage = document.getElementById('warningMessage');
    closeButton.addEventListener('click', () => {
        setTimeout(() => {
            containerAccount.style.opacity = '1';
            navbar.style.opacity = '1';
            footer.style.opacity = '1';
            addAddressContainer.style.display = 'none';
            warningMessage.textContent = '';
        }, 50); 
    });
    addAddressButton.forEach(button => {
        button.addEventListener('click', () => {
            addAddressContainer.style.display = 'block';
            setTimeout(() => {
                containerAccount.style.opacity = '0.2';
                navbar.style.opacity = '0.2';
                footer.style.opacity = '0.2';
                addAddressContainer.style.opacity = '1';
            }, 10); 
        });
    });
const addAddress = document.getElementById('add-address-form');
addAddress.addEventListener('submit', async(e) => {
    e.preventDefault();
    const name = addAddress.name.value;
    const phoneNumber = addAddress.phoneNumber.value;
    const street = addAddress.street.value;
    const city = addAddress.city.value;
    const country = addAddress.country.value;
    warningMessage.textContent = '';
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
        addAddress.style.display = 'none';
          window.location.reload();
        }
      }catch(err){
        console.log(err);
      }
});