const form = document.querySelector('form');
const msgError = document.getElementById('msgError');
const msgOk = document.getElementById('msgOk');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const image = form.image.value;
    const name = form.name.value;
    const price = form.price.value;
    const category = form.category.value;
    const subcategory = form.subcategory.value;
    const cantity = form.cantity.value;
    msgError.textContent = '';
    msgOk.textContent = '';
    try{
        const res = await fetch('/add-article', {
            method: 'POST',
            body: JSON.stringify({image, name, price, category, subcategory, cantity}),
            headers: {'Content-Type': 'application/json'}
          });
        const data = await res.json();
        if(data.msg){
            alert(data.msg);
            location.reload();
        }
        if(data.error){
            msgError.textContent = data.error;
        }
    }catch(err){
        console.error(err);
    }
})