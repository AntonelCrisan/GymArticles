document.addEventListener('DOMContentLoaded', function() {
    const modifyBilingDataButton = document.getElementById('modifyBilingDataButton');
    const navbar = document.getElementsByClassName('navbar')[0];
    const footer = document.getElementsByClassName('footer')[0];
    const mainContainer = document.getElementsByClassName('main-container')[0];
    const modifyBilingDataContainer = document.getElementsByClassName('modify-bilingData-container')[0];
    const addAddressContainerForBilingData = document.getElementsByClassName('add-address-container')[0];
    const closeBilingDataContainer = document.getElementById('close-button-bilingData');
    const addressCheckboxesBilingData = document.querySelectorAll('.select-address-bilingData input[type="checkbox"]');
    const addAddresForBilingData = document.getElementById('add-address-bilingData');
    const addAddressBilingDataButton = document.getElementById('addAddressBilingDataButton');
      // Function to attach event listener to choose another address button
  function selectAddressForBilingData() {
    document.querySelector('#modifyBilingDataButton').addEventListener('click', function () {
      modifyBilingDataContainer.style.display = 'block';
      setTimeout(() => {
          mainContainer.style.opacity = '0.2';
          navbar.style.opacity = '0.2';
          footer.style.opacity = '0.2';
          modifyBilingDataContainer.style.opacity = '1';
      }, 10); 
    });
  };
//   selectAddressForBilingData();

   // Loop through all address checkboxes and handle address selection
   addressCheckboxesBilingData.forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
      if (this.checked) {
        // Uncheck other checkboxes
        addressCheckboxesBilingData.forEach((cb) => {
          if (cb !== this) cb.checked = false;
        });

        // Get the address details from data attributes
        const selectedAddress = this.closest('.select-address-bilingData');
        const name = selectedAddress.dataset.name;
        const phone = selectedAddress.dataset.phone;
        const street = selectedAddress.dataset.street;
        const city = selectedAddress.dataset.city;
        const country = selectedAddress.dataset.country;

        // Update the first container with the chosen address details
        const firstContainer = document.querySelector('.title-billing-data');
        firstContainer.innerHTML = `
          <h4>1</h4>
          <h3>Order modality</h3>
          <div></div>
        `;
        const infoCard = document.querySelector('.info-card-bilingData');
        infoCard.innerHTML = `
          <div class="name-phone">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#06b6d4">
                <path d="M480-477.61q34.2 0 58.29-24.1 24.1-24.09 24.1-58.29t-24.1-58.29q-24.09-24.1-58.29-24.1t-58.29 24.1q-24.1 24.09-24.1 58.29t24.1 58.29q24.09 24.1 58.29 24.1Zm0 285.15q120.33-110.08 178.73-198.59 58.4-88.52 58.4-161.91 0-107.31-68.67-175.74t-168.47-68.43q-99.79 0-168.46 68.43-68.66 68.43-68.66 175.74 0 73.39 58.4 161.79 58.4 88.39 178.73 198.71Zm0 120.59Q315.17-211.26 233.52-329.36q-81.65-118.1-81.65-223.6 0-153.28 98.95-244.22 98.95-90.95 229.18-90.95 130.23 0 229.18 90.95 98.95 90.94 98.95 244.22 0 105.5-81.65 223.6T480-71.87ZM480-560Z"/>
              </svg>
            </span>
            <h5>${name}</h5>
            <div><h6>-</h6></div>
            <div><h6>${phone}</h6></div>
          </div>
          <div class="street" style="margin-left: 35px; color: #666666">
            <div>${street}</div>
            <div>${city}</div>
            <div>${country}</div>
          </div>
          <div style="margin-left: 35px">
             <button
                  class="modifyBilingDataButton"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                  "
                  id="modifyBilingDataButton"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20px"
                    viewBox="0 -960 960 960"
                    width="20px"
                    fill="#ffffff"
                  >
                    <path
                      d="M216-216h51l375-375-51-51-375 375v51Zm-72 72v-153l498-498q11-11 23.84-16 12.83-5 27-5 14.16 0 27.16 5t24 16l51 51q11 11 16 24t5 26.54q0 14.45-5.02 27.54T795-642L297-144H144Zm600-549-51-51 51 51Zm-127.95 76.95L591-642l51 51-25.95-25.05Z"
                    />
                  </svg>
                  Modify
                </button>
          </div>
        `;

        // Reattach the event listener to the new Choose Another Address button
        selectAddressForBilingData();

        // Close the modal
        mainContainer.style.opacity = '1';
        navbar.style.opacity = '1';
        footer.style.opacity = '1';
        modifyBilingDataContainer.style.display = 'none';
      }
    });
  });
  if(modifyBilingDataButton){
  // Open address selection modal
  modifyBilingDataButton.addEventListener('click', () => {
    modifyBilingDataContainer.style.display = 'block';
    setTimeout(() => {
        mainContainer.style.opacity = '0.2';
        navbar.style.opacity = '0.2';
        footer.style.opacity = '0.2';
        modifyBilingDataContainer.style.opacity = '1';
    }, 10); 
  });
  }
    

  // Close the address selection modal
  closeBilingDataContainer.addEventListener('click', () => {
    setTimeout(() => {
        mainContainer.style.opacity = '1';
        navbar.style.opacity = '1';
        footer.style.opacity = '1';
        modifyBilingDataContainer.style.display = 'none';
    }, 50); 
  });
  
  // Add new address event
  addAddresForBilingData.addEventListener('click', () => {
    addAddressContainerForBilingData.style.display = 'block';
    modifyBilingDataContainer.style.display = 'none';
    setTimeout(() => {
        mainContainer.style.opacity = '0.2';
        navbar.style.opacity = '0.2';
        footer.style.opacity = '0.2';
        addAddressContainerForBilingData.style.opacity = '1';
    }, 10); 
  });
  if(addAddressBilingDataButton){
    addAddressBilingDataButton.addEventListener('click', () => {
        addAddressContainerForBilingData.style.display = 'block';
        setTimeout(() => {
            mainContainer.style.opacity = '0.2';
            navbar.style.opacity = '0.2';
            footer.style.opacity = '0.2';
            addAddressContainerForBilingData.style.opacity = '1';
        }, 10); 
      })
  }
  
});
