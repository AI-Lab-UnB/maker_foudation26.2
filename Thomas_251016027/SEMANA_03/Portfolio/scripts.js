window.addEventListener('DOMContentLoaded', event => {

    const navbar = document.body.querySelector('#mainNav');
    
    // Navbar shrink function
    var navbarShrink = function () {
        if (!navbar) {
            return;
        }
        if (window.scrollY === 0) {
            navbar.classList.remove('navbar-shrink');
        } else {
            navbar.classList.add('navbar-shrink');
        }
    };

    // Shrink the navbar 
    navbarShrink();
    document.addEventListener('scroll', navbarShrink);

    // Navbar toggler
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler) {
        navbarToggler.addEventListener('click', () => {
            navbarCollapse.classList.toggle('show');
        });
    }

    // Close menu when clicking links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        });
    });

    // Custom ScrollSpy and Navbar Color Transition
    const sections = document.querySelectorAll('.page-section');
    
    const colors = {
        'skills': '#6779ff',
        'portfolio': '#72e6e0',
        'about': '#56ff00',
        'growth': '#d0ff00',
        'companies': '#dc3545'
    };

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                // Remove active class from all links
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                // Add active class to corresponding link
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                
                // Change navbar color based on section
                if (colors[id]) {
                    navbar.style.borderBottom = `3px solid ${colors[id]}`;
                    document.documentElement.style.setProperty('--current-section-color', colors[id]);
                } else {
                    navbar.style.borderBottom = '3px solid transparent';
                    document.documentElement.style.setProperty('--current-section-color', '#fff');
                }
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Check masthead visibility to remove border when at the very top
    const masthead = document.querySelector('.masthead');
    if (masthead) {
        const mastheadObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                navbar.style.borderBottom = '3px solid transparent';
            }
        }, { rootMargin: '-10% 0px 0px 0px' });
        mastheadObserver.observe(masthead);
    }
});
