const cancelButton = document.getElementById('cancelButton');
const deleteAddressButton = document.querySelectorAll('.deleteAddressButton');
const delete_address = document.getElementsByClassName('delete-address')[0];
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
            const deleteButton = document.getElementById('deleteButton');
            const buttonText = document.getElementById('buttonText');
            const spinner = document.getElementById('spinner');
            deleteButton.disabled = true;
            buttonText.classList.add('d-none');
            spinner.classList.remove('d-none');
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
            }finally {
                buttonText.classList.remove('d-none');
                spinner.classList.add('d-none');
                deleteButton.disabled = false;
              }
        }) 
    });
});