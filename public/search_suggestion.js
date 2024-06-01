function sendData(e){
    const searchResults = document.getElementById('searchResults');
    let match = e.value.match(/^[a-zA-Z]*/);
    let match2 = e.value.match(/\s*/);
    if(match2[0] === e.value){
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }
    if(match[0] === e.value){
        fetch('getArticles', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({playload: e.value})
        }).then(res => res.json().then(data => {
            let playload = data.playload;
            searchResults.innerHTML = '';
            if(playload.length < 1){
                searchResults.style.display = 'block';
                searchResults.innerHTML = '<p>No results found</p>';
                return;
            }
            playload.forEach((item, index) => {
                if(index > 0){
                    searchResults.innerHTML += '<hr>';
                }
                searchResults.style.display = 'block';
                searchResults.innerHTML += `<p>${item.name}</p>`
            });
            return;
        }));
    }
    
}