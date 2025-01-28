  // Retrieve the selected address from localStorage
  const selectedAddress = JSON.parse(localStorage.getItem('selectedAddressForOrder'));
  const selectedAddressForBilingData = JSON.parse(localStorage.getItem('selectedAddressBilingData'));
  const paymentMethod = localStorage.getItem('paymentMethod');
  const infoPaymentMethod = localStorage.getItem('infoPayment');
  const orderTotal = localStorage.getItem('newTotal');
  const deliveryCostAndProcessingCost = localStorage.getItem('deliveryCostAndProcessing'); 


//Displays address for delivery address
  if (selectedAddress) {
      // Display the address
      document.getElementById('summary-orderModality').innerHTML = `
        <p><strong>Order through courier</strong></p>
        <p>${selectedAddress.name} - ${selectedAddress.phoneNumber}</p>
        <p>${selectedAddress.street} ${selectedAddress.city}, ${selectedAddress.country}</p>
      `;
  } else {
      document.getElementById('addressSummary').innerHTML = '<p>No address selected.</p>';
  }
//Displays address for billing address
  if (selectedAddressForBilingData) {
      // Display the address
      document.getElementById('summary-BilingData').innerHTML = `
        <p>${selectedAddressForBilingData.name} - ${selectedAddressForBilingData.phoneNumber}</p>
        <p>${selectedAddressForBilingData.street} ${selectedAddressForBilingData.city}, ${selectedAddressForBilingData.country}</p>
      `;
  } else {
      document.getElementById('bilingSummary').innerHTML = '<p>No address selected.</p>';
  }
//Displays payment method
  if(paymentMethod){
      document.getElementById('summary-paymentMethod').innerHTML = `
    <p><strong>${paymentMethod}</strong></p>
    <p>${infoPaymentMethod}</p>
      `
  }else{
      document.getElementById('paymentMethod').innerHTML = '<p>No payment method selected.</p>'
  }
//Displays delivery cost and processing cost
const deliveryCostAndProcessingCostElement = document.getElementById('delivery-cost-processing');
if(deliveryCostAndProcessingCost === 'Free'){
    deliveryCostAndProcessingCostElement.style.color = '#009900';
    deliveryCostAndProcessingCostElement.innerText = `${deliveryCostAndProcessingCost}`;
}else{
    deliveryCostAndProcessingCostElement.innerText = `${deliveryCostAndProcessingCost}`;
}
  //Displays total
  document.getElementById('order-total').innerText = `Order total: $${orderTotal}`;




  //Sends order based on payment method
const onlineCard = document.getElementById('online-card-button');
const payCourier = document.getElementById('pay-courier-button');
  if(paymentMethod === 'Online card'){
    document.getElementById('payCourier-button').style.display = 'none';
    onlineCard.addEventListener('click', async (e) => {
      e.preventDefault();
        const orderData = {
            deliveryAddress: selectedAddress,
            billingAddress: selectedAddressForBilingData,
            paymentMethod: paymentMethod,
            orderTotal: orderTotal,
            deliveryCostAndProcessingCost: deliveryCostAndProcessingCost,
          }
          try {
            // Send POST request to your backend /pay route
            const response = await fetch('/pay', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(orderData)
            });
            const data = await response.json();
            if (data.url) {
              window.location.href = data.url;
            } else {
              console.error('Error during payment process:', data.error);
            }
          } catch (error) {
            console.error('Error during payment:', error);
          }
    });
  }else{
    document.getElementById('onlineCard-button').style.display = 'none';
    payCourier.addEventListener('click', async (e) => {
      e.preventDefault();
      const orderData = {
        deliveryAddress: selectedAddress,
        billingAddress: selectedAddressForBilingData,
        paymentMethod: paymentMethod,
        orderTotal: orderTotal,
        deliveryCostAndProcessingCost: deliveryCostAndProcessingCost,
      }
      try {
        // Send POST request to your backend /pay-courier route
        const response = await fetch('/pay-courier', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
        const data = await response.json();
        if (data.success) {
          window.location.href = '/order-placed';
        } else {
          console.error('Error during payment process:', data.statusText);
        }
      } catch (error) {
        console.error('Error during payment:', error);
      }
    });
  }