// // const filtrableCard = document.querySelectorAll('.filtrable-card .card');

// // const filterCards = e => {
// //     document.querySelector(".active").classList.remove("active");
// //     e.target.classList.add("active");
// //     filtrableCard.forEach(card => {
// //         card.classList.add("hide");
// //         if(card.dataset.name === e.target.dataset.name || e.target.dataset.name === "all"){
// //             card.classList.remove("hide");
// //         }
// //     })
// // }

// const categories = document.querySelectorAll('.list-unstyled li');

// function handleCategoryClick(subcategory) {
//     // Make an AJAX request to the server with the selected subcategory
//     fetch(`http://localhost:3012/?subcategory=${subcategory}`)
//      .then(response => response.json())
//      .then(data => {
//         // Update the page with the filtered articles
//         // For example, you can replace the articles container with the filtered articles
//         document.getElementById('card').innerHTML = ''; // Clear the container
//         data.articles.forEach(article => {
//           // Append each article to the container
//           const articleElement = document.createElement('div');
//           articleElement.textContent = article.subcategory; // Assuming title is the property containing article title
//           document.getElementById('card').appendChild(articleElement);
//         });
//       })
//      .catch(error => console.error('Error fetching articles:', error));
// }
// categories.forEach(li => {
//     li.addEventListener('click', () => {
//         const label = li.querySelector('label');
//         if (label) {
//             const subcategory = label.textContent.trim();
//             handleCategoryClick(subcategory);
//         } else {
//             console.error('Label element not found in clicked list item');
//         }
//     });
// });

