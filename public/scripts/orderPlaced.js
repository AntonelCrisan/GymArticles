// Function to calculate estimated delivery date excluding weekends
function calculateDeliveryDate() {
    const deliveryDays = 5; // Number of business days for delivery
    let remainingDays = deliveryDays;

    // Get the current date
    let estimatedDeliveryDate = new Date();

    // Function to check if the current day is a weekend (Saturday or Sunday)
    function isWeekend(date) {
        const day = date.getDay();
        return day === 6 || day === 0; // 6 = Saturday, 0 = Sunday
    }

    // Loop to add delivery days, skipping weekends
    while (remainingDays > 0) {
        estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 1); // Add one day

        // If it's not a weekend, subtract from remaining days
        if (!isWeekend(estimatedDeliveryDate)) {
            remainingDays--;
        }
    }

    // Format the date to a readable format
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = estimatedDeliveryDate.toLocaleDateString('en-US', options);

    // Insert the formatted date into the HTML
    document.getElementById('estimated-delivery-date').textContent = formattedDate;
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', calculateDeliveryDate);