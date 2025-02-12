import selectedAddressForOrder from '../checkout-orderModality/chosse-address.js';
import selectedAddressBilingData from '../checkout-BilingData/modify-bilingData.js'
import paymentMethod from '../checkout-paymentMethod/paymentMethod.js';
import { infoPayment, getTotal, deliveryCostAndProcessingCost} from '../checkout-paymentMethod/paymentMethod.js';
const nextStep = document.getElementById('continue-button');
const onlineCard = document.getElementById('online-card');
const repayCourier = document.getElementById('repay-courier');
const warningMessage = document.getElementById('warning-message');
const message = document.getElementById('message');
nextStep.addEventListener('click', (e) => {
    e.preventDefault();
    const selectedAddress = selectedAddressForOrder();
    console.log(selectedAddress)
    if(!selectedAddress){
        showWarningMessage('Please add a delivery address or billing address');
    }
    if(!onlineCard.checked && !repayCourier.checked){
        showWarningMessage('Please select a payment method');
    }else{
        localStorage.setItem('selectedAddressForOrder', selectedAddressForOrder());
        localStorage.setItem('selectedAddressBilingData', selectedAddressBilingData());
        localStorage.setItem('paymentMethod', paymentMethod());
        localStorage.setItem('infoPayment', infoPayment());
        localStorage.setItem('newTotal', getTotal());
        localStorage.setItem('deliveryCostAndProcessing', deliveryCostAndProcessingCost());
        window.location.href = '/summary';
    }
   
});

function showWarningMessage(messageParam){
    message.innerText = messageParam;
    warningMessage.classList.remove('d-none');
    //Close warningMessage
    setTimeout(() => {
        warningMessage.classList.add('hide');
        setTimeout(() => {
            warningMessage.classList.add('d-none');
            warningMessage.classList.remove('hide');
            location.reload();
        }, 5000);
    }, 7000);
}