import selectedAddressForOrder from '../checkout-orderModality/chosse-address.js';
import selectedAddressBilingData from '../checkout-BilingData/modify-bilingData.js'
import paymentMethod from '../checkout-paymentMethod/paymentMethod.js';
import { infoPayment } from '../checkout-paymentMethod/paymentMethod.js';
const nextStep = document.getElementById('continue-button');
nextStep.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.setItem('selectedAddressForOrder', selectedAddressForOrder());
    localStorage.setItem('selectedAddressBilingData', selectedAddressBilingData());
    localStorage.setItem('paymentMethod', paymentMethod());
    localStorage.setItem('infoPayment', infoPayment());
    console.log(infoPayment());
    window.location.href = '/summary';
});
