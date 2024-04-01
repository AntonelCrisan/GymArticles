const data = [
  {
    id: 1,
    name: "Bench",
    href: "#",
    description: "BLALBA",
    price: "$100"
  },
  {
    id: 2,
    name: "Dumbell",
    href: "#",
    description: "BLALBA",
    price: "$50"
  },
  {
    id: 3,
    name: "Ball",
    href: "#",
    description: "BLALBA",
    price: "$10"
  },
  {
    id: 4,
    name: "Pants",
    href: "#",
    description: "BLALBA",
    price: "$25"
  }
];
// Iterăm prin fiecare element din array și generăm HTML-ul corespunzător
data.forEach(item => {
  // Creăm un element div cu clasele specificate
  const div = document.createElement('div');
  div.classList.add('col-lg-4', 'col-md-6', 'mb-4');

  // Setăm un id pentru div
  div.id = `card-${item.id}`;

  // Generăm HTML-ul pentru card
  div.innerHTML = `
    <div class="card">
        <div class="card-body">
            <h5 class="card-title" id="name">${item.name}</h5>
            <p class="card-text" id="description">${item.description}</p>
            <div style="display: flex;align-items: baseline; justify-content: start; gap: 10px;">
                <a href="${item.href}" class="btn btn-primary">Buy Now</a>
                <p id="price">${item.price}</p>
            </div>
        </div>
    </div>
  `;

  // Adăugăm div-ul generat în interiorul div-ului cu id-ul "card"
  document.getElementById('card').appendChild(div);
});
