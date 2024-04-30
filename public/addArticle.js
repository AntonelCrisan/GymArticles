// const category = document.getElementsByTagName('a');
// for(let i = 0; i < category.length; i++){
//     category[i].addEventListener("click", () =>{
//     for(let j = 0; j < category.length; j++){
//     category[j].style.color = 'black';
//     }
//     category[i].style.color = '#b26ce0';
// })
// }

const form = document.querySelector('form');
const msgError = document.getElementById('msgError');
const msgOk = document.getElementById('msgOk');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const image = form.image.value;
    const name = form.name.value;
    const price = form.price.value;
    const category = form.category.value;
    msgError.textContent = '';
    msgOk.textContent = '';
    try{
        const res = await fetch('/add-article', {
            method: 'POST',
            body: JSON.stringify({image, name, price, category}),
            headers: {'Content-Type': 'application/json'}
          });
        const data = await res.json();
        if(data.msg){
            msgOk.textContent = data.msg;
            location.reload();
        }
        if(data.error){
            msgError.textContent = data.error;
        }
    }catch(err){
        console.error(err);
    }
})