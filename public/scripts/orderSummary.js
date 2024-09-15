// const { infoPayment } = require("./checkout-paymentMethod/paymentMethod");

  // Retrieve the selected address from localStorage
  const selectedAddress = JSON.parse(localStorage.getItem('selectedAddressForOrder'));
  const selectedAddressForBilingData = JSON.parse(localStorage.getItem('selectedAddressBilingData'));
  const paymentMethod = localStorage.getItem('paymentMethod');
  const infoPaymentMethod = localStorage.getItem('infoPayment');
  const orderTotal = localStorage.getItem('newTotal');

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

  if (selectedAddressForBilingData) {
      // Display the address
      document.getElementById('summary-BilingData').innerHTML = `
        <p>${selectedAddressForBilingData.name} - ${selectedAddressForBilingData.phoneNumber}</p>
        <p>${selectedAddressForBilingData.street} ${selectedAddressForBilingData.city}, ${selectedAddressForBilingData.country}</p>
      `;
  } else {
      document.getElementById('bilingSummary').innerHTML = '<p>No address selected.</p>';
  }

  if(paymentMethod){
      document.getElementById('summary-paymentMethod').innerHTML = `
    <p><strong>${paymentMethod}</strong></p>
    <p>${infoPaymentMethod}</p>
      `
  }else{
      document.getElementById('paymentMethod').innerHTML = '<p>No payment method selected.</p>'
  }
  if(paymentMethod === "Online card"){
    document.getElementById('delivery-cost-processing').innerText = 'Free';
    document.getElementById('delivery-cost-processing').style.color = '#009900';
  }else{
    document.getElementById('delivery-cost-processing').innerText = '$3';
  }
  document.getElementById('order-total').innerText = `Order total: $${orderTotal}`;