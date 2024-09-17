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
const sendOrderButton = document.getElementById('send-order-button');
  if(paymentMethod === 'Online card'){
    sendOrderButton.addEventListener('click', () => {
        window.location.href = '/pay';
    });
  }else{
    sendOrderButton.addEventListener('click', () => {
        window.location.href = '/order-placed'
    });
  }