const addToCartButton = document.querySelector('.btn-primary');
addToCartButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    const name = urlParams.get('name'); 
    // const idUser = urlParams.get('idU');
    try {
        const res = await fetch('/product', {
            method: 'POST',
            body: JSON.stringify( {id, name} ),
            headers:{'Content-Type': 'application/json'}
        })
        const data = await res.json();
        if(data.error){
            console.log(data.error);
        }
        if(data.message){
            console.log(data.message);
        }
    } catch (error) {
        console.error(error);
    }
});
