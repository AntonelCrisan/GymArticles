document.addEventListener('DOMContentLoaded', () => {
const increaseCantityButtons = document.querySelectorAll('#increaseCantityButton');
const decreaseCantityButtons = document.querySelectorAll('#decreaseCantityButton');
const qtyValues = document.querySelectorAll('.qty-value');
const inputHidden = document.querySelectorAll('.hidden');
async function updateCantity(id, cantity) {
    try {
        const response = await fetch(`updateCantity/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: id.dataset,
                quantity: cantity
            })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const result = await response.json();
        setTimeout(()=>{
            if (result.success) {
                window.location.reload();
            } else {
                console.error('Failed to update quantity');
                return null;
            }
        }, 1000)
        
    } catch (error) {
        console.error('Error updating quantity:', error);
        return null;
    }
}
// Function to enable or disable buttons based on the quantity value
function updateButtonStates() {
    qtyValues.forEach((qtyValue, index) => {
        const decreaseButton = decreaseCantityButtons[index];
        let currentValue = parseInt(qtyValue.textContent, 10);
        // Enable/Disable decrease button based on quantity
        if (currentValue > 1) {
            decreaseButton.disabled = false;
        } else {
            decreaseButton.disabled = true;
        }
    });
}
// Add event listeners to each increase button
increaseCantityButtons.forEach((plus, index) => {
    plus.addEventListener('click', async() => {
        const qtyValue = qtyValues[index];
        let currentValue = parseInt(qtyValue.textContent, 10);
        currentValue += 1;
        qtyValue.textContent = currentValue;
        inputHidden.value = currentValue;
        updateButtonStates(); // Update button states after increment
        const id = plus.dataset.id;
        const cantity = inputHidden.value;
        await updateCantity(id, cantity);
    });
});
// Add event listeners to each decrease button
decreaseCantityButtons.forEach((minus, index) => {
    minus.addEventListener('click', async() => {
        const qtyValue = qtyValues[index];
        let currentValue = parseInt(qtyValue.textContent, 10);
        if (currentValue > 1) { // Ensure quantity doesn't go below 1
            currentValue -= 1;
            qtyValue.textContent = currentValue;
            inputHidden.value = currentValue;
            const id = minus.dataset.id;
            const cantity = inputHidden.value;
            await updateCantity(id, cantity);
        }
        updateButtonStates(); // Update button states after decrement
    });
});
// Initial button state update
updateButtonStates();
});
