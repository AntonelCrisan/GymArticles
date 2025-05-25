document.addEventListener('DOMContentLoaded', () => {
  const minusBtn = document.getElementById("decreaseCantityButton");
  const plusBtn = document.getElementById("increaseCantityButton");
  const qtyValue = document.querySelector(".qty-value");
  const qtyInput = document.querySelector("input[name='cantity']");
  const priceElement = document.querySelector(".price strong");

  if (!minusBtn || !plusBtn || !qtyValue || !priceElement) return;

  const basePrice = parseFloat(priceElement.getAttribute("data-base-price"));
  let quantity = parseInt(qtyValue.textContent);

  const updateButtons = () => {
    minusBtn.disabled = quantity <= 1;
    plusBtn.disabled = quantity >= 10;
  };

  const updateUI = () => {
    qtyValue.textContent = quantity;
    qtyInput.value = quantity;
    priceElement.textContent = `$${(basePrice * quantity).toFixed(2)}`;
  };

  plusBtn.onclick = () => {
    if (quantity < 10) {
      quantity++;
      updateUI();
      updateButtons();
    }
  };

  minusBtn.onclick = () => {
    if (quantity > 1) {
      quantity--;
      updateUI();
      updateButtons();
    }
  };
  updateButtons();
});
