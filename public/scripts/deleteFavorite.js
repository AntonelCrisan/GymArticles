const deleteFavorite = document.querySelectorAll('#deleteFavorite');
deleteFavorite.forEach(button => {
    button.addEventListener('click', async(e)=>{
        e.preventDefault();
        const id = button.dataset.id;
        try {
            const response = await fetch(`/deleteFavorite/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if(result.success){
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
        }
    })

});