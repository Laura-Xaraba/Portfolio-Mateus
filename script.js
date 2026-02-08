document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. SETUP & UTILS ----
    const loader = document.querySelector('.loader');
    const progressBar = document.querySelector('.loader-progress');

    if (progressBar) {
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 100);
    }

    setTimeout(() => {
        if (loader) loader.style.transform = 'translateY(-100%)';
    }, 2000);

    // Scroll Animations
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.animate-up');
    animateElements.forEach(el => observer.observe(el));

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });


    // Mobile Menu Toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navLinksContainer = document.querySelector('.nav-links');
    const navElement = document.querySelector('nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
            navElement.classList.toggle('active');
        });
    }

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinksContainer.classList.remove('active');
            navElement.classList.remove('active');
        });
    });

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const storageTheme = localStorage.getItem('theme');

    // Apply saved theme
    if (storageTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');

            if (document.body.classList.contains('light-mode')) {
                localStorage.setItem('theme', 'light');
            } else {
                localStorage.setItem('theme', 'dark');
            }
        });
    }


    // ---- PDF VIEWER ----
    const pdfModal = document.getElementById('pdf-modal');
    const pdfFrame = document.getElementById('pdf-frame');
    const pdfTitle = document.getElementById('pdf-title');
    const closePdfModal = document.querySelector('.close-pdf-modal');

    function openPDF(url, title) {
        if (!url || url === '#') return;
        pdfFrame.src = url;
        pdfTitle.innerText = title || "Visualização do Projeto";
        pdfModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Lock background
    }

    function closePDF() {
        pdfModal.classList.remove('show');
        pdfFrame.src = '';
        document.body.style.overflow = '';
    }

    if (closePdfModal) closePdfModal.addEventListener('click', closePDF);

    // Close PDF modal with escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePDF();
    });

    // Global listener for project cards
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (card) {
            e.preventDefault();
            const url = card.getAttribute('href');
            const title = card.querySelector('.card-title')?.innerText;
            openPDF(url, title);
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === pdfModal) closePDF();
    });
});
