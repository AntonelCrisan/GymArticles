import selectedAddressForOrder from '../checkout-orderModality/chosse-address.js';
import selectedAddressBilingData from '../checkout-BilingData/modify-bilingData.js'
import paymentMethod from '../checkout-paymentMethod/paymentMethod.js';
import { infoPayment, getTotal, deliveryCostAndProcessingCost} from '../checkout-paymentMethod/paymentMethod.js';
const nextStep = document.getElementById('continue-button');
const onlineCard = document.getElementById('online-card');
const repayCourier = document.getElementById('repay-courier');
const warningMessage = document.getElementById('warning-message');
nextStep.addEventListener('click', (e) => {
    e.preventDefault();
    if(!onlineCard.checked && !repayCourier.checked){
        showWarningMessage();
        window.location.href = '#paymentSection';
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

function showWarningMessage(){
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