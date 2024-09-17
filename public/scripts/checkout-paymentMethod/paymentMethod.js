// Get elements
const onlineCard = document.getElementById('online-card');
const repayCourier = document.getElementById('repay-courier');
const paymentProccesing = document.getElementById('paymentProccesing');
const totalElement = document.querySelector('.summary-item.total .amount');
let originalTotal = parseFloat(totalElement.textContent.replace('$', ''));
const paymentProcessingCost = 3;
const state = {
    summaryTotal: 0
};
const getTotal = () => state.summaryTotal;
const setTotal = (summaryTotal) => {
    state.summaryTotal = summaryTotal;
};
function updateTotal(addProcessingCost) {
    let newTotal = originalTotal;
    if (addProcessingCost) {
        newTotal += paymentProcessingCost;
    }
    totalElement.textContent = `$${newTotal.toFixed(2)}`;
    setTotal(newTotal);
}
onlineCard.addEventListener('click', () => {
    if (!onlineCard.checked) {
        onlineCard.checked = true;
      }
    repayCourier.checked = false;
    paymentProccesing.style.display = 'none';
    updateTotal(false);
});
repayCourier.addEventListener('click', () => {
    if (!repayCourier.checked) {
        repayCourier.checked = true; 
      }
    onlineCard.checked = false;
    paymentProccesing.style.display = 'flex';
    updateTotal(true);
});

const paymentMethod = () => {
    if (onlineCard.checked) {
        return onlineCard.value;
    }else{
        return repayCourier.value;
    }
}
const infoPayment = () => {
const infoOnlineCard = document.getElementById('info-onlineCard');
const infoRepayCourier = document.getElementById('info-RepayCourier');
    if (onlineCard.checked) {
        return infoOnlineCard.textContent;
    }else{
        return infoRepayCourier.textContent;
    }
}
const deliveryCostAndProcessingCost = () =>{
    const deliveryCostText = document.getElementById('deliveryCost').textContent;
    const deliveryCost = parseFloat(deliveryCostText.replace('$', ''));
    if(onlineCard.checked){
        if(deliveryCostText === 'Free'){
            return deliveryCostText;
        }else{
            return deliveryCostText;
        }
    }else{
        if(deliveryCostText === 'Free'){
            const processingCost = '$3';
            return processingCost;
        }else{
            const processingCost = 3;
            const totalCostAdded =  deliveryCost + processingCost;
            const totalCost = totalCostAdded.toString();
            return '$'+totalCost;
        }
    }
}
export default paymentMethod;
export {infoPayment, getTotal, deliveryCostAndProcessingCost};
