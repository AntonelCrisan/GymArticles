document.addEventListener('DOMContentLoaded', () => {
  const minusBtn = document.getElementById("decreaseCantityButton");
  const plusBtn = document.getElementById("increaseCantityButton");
  const qtyValue = document.querySelector(".qty-value");
  const qtyInput = document.querySelector("input[name='cantity']");
  const priceElement = document.querySelector(".price strong");
  const addToCartBtn = document.getElementById("addToCartButtonFromDetails");
  const cartCountElement = document.getElementById("cart-count");

  // Dacă lipsește ceva, ieșim
  if (!minusBtn || !plusBtn || !qtyValue || !priceElement || !qtyInput || !addToCartBtn) return;

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

  plusBtn.addEventListener("click", () => {
    if (quantity < 10) {
      quantity++;
      updateUI();
      updateButtons();
    }
  });

  minusBtn.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      updateUI();
      updateButtons();
    }
  });

  updateButtons();
  updateUI();

  // Funcția pentru adăugare în coș
  async function updateCart() {
    try {
      const quantity = parseInt(qtyInput.value, 10);
      const productId = addToCartBtn.dataset.productId;

      const response = await fetch('/addToCartFromDetail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });

      const result = await response.json();
      if (result.success) {
        const newCount = result.newCartCount;
        if (newCount > 0) {
          cartCountElement.textContent = newCount;
          cartCountElement.style.display = 'flex';
        } else {
          cartCountElement.style.display = 'none';
        }
      } else {
        showWarningOutOfStock();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      window.location.assign('/login');
    }
  }

  // Butonul de Adaugă în coș
  addToCartBtn.addEventListener('click', updateCart);

  // Afișează mesajul de stoc epuizat
  function showWarningOutOfStock() {
    const message = document.getElementById('product-outof-stock');
    if (message) {
      message.classList.remove('d-none');
      setTimeout(() => {
        message.classList.add('hide');
        setTimeout(() => {
          message.classList.add('d-none');
          message.classList.remove('hide');
        }, 1000);
      }, 1500);
    }
  }
});
