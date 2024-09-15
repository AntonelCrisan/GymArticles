// Get elements
const onlineCard = document.getElementById('online-card');
const repayCourier = document.getElementById('repay-courier');
const paymentProccesing = document.getElementById('paymentProccesing');
const totalElement = document.querySelector('.summary-item.total .amount'); // Total amount element
// Parse the original total from the DOM
let originalTotal = parseFloat(totalElement.textContent.replace('$', ''));
const paymentProcessingCost = 3; // Processing cost for courier repayment
// Function to update the total
function updateTotal(addProcessingCost) {
    let newTotal = originalTotal;
    if (addProcessingCost) {
        newTotal += paymentProcessingCost;
    }
    totalElement.textContent = `$${newTotal.toFixed(1)}`;
}
// Event listener for "Online Card" option
onlineCard.addEventListener('click', () => {
    if (!onlineCard.checked) {
        onlineCard.checked = true; // Force the checkbox to stay checked
      }
    repayCourier.checked = false;
    paymentProccesing.style.display = 'none';
    // Reset the total to the original amount when "Online Card" is selected
    updateTotal(false);
});
// Event listener for "Repay Courier" option
repayCourier.addEventListener('click', () => {
    if (!repayCourier.checked) {
        repayCourier.checked = true; // Force the checkbox to stay checked
      }
    onlineCard.checked = false;
    paymentProccesing.style.display = 'flex';
    // Add the payment processing cost to the total when "Repay Courier" is selected
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

export default paymentMethod;
export {infoPayment};
