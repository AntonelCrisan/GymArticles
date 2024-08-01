document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar-link');
    function updateActiveLink() {
        const currentPath = window.location.pathname;
        links.forEach(link => {
            link.classList.remove('active');
            // Extract the href attribute and compare it with the current path
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath) {
                link.classList.add('active');
            }
        });
    }
    // Update active link on page load
    updateActiveLink();
    // Set up click event listeners to manually change the active class
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            // Optionally prevent the default behavior to manage navigation with JS frameworks or for a specific reason
            // e.preventDefault();
            links.forEach(link => {
                link.classList.remove('active');
            });
            link.classList.add('active');
        });
    });
    // Optionally, if you are using a frontend router, you might need to listen to route changes
    // Example: Using a history listener if managing routes with history API
    window.addEventListener('popstate', updateActiveLink);
});
