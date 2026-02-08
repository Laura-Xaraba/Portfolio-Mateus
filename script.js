document.addEventListener('DOMContentLoaded', () => {
    // ---- 1. SETUP & UTILS ----
    const loader = document.querySelector('.loader');
    setTimeout(() => {
        loader.style.transform = 'translateY(-100%)';
    }, 1500);

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

    // ---- 2. CMS / AUTHENTICATION ----
    const CREDENTIALS = { user: 'Omerpus', pass: 'Mysterio888!' };
    const STORAGE_KEY = 'cms_auth_token';
    const CONTENT_KEY = 'cms_content_data';

    // Elements
    const adminLock = document.getElementById('admin-lock');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const closeModal = document.querySelector('.close-modal');
    const addProjectBtn = document.createElement('button'); // Virtual button to trigger logic
    addProjectBtn.id = 'add-project-btn';

    // Load Saved Content
    loadSavedContent();

    // Check Login State
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
        enableEditMode();
    } else {
        disableEditMode();
    }

    // Modal Events
    adminLock.addEventListener('click', (e) => {
        e.preventDefault();
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
            if (confirm('Você já está logado. Deseja sair?')) {
                logout();
            }
        } else {
            loginModal.classList.add('show');
        }
    });

    closeModal.addEventListener('click', () => loginModal.classList.remove('show'));
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.remove('show');
    });

    // Login Logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        if (user === CREDENTIALS.user && pass === CREDENTIALS.pass) {
            localStorage.setItem(STORAGE_KEY, 'true');
            loginModal.classList.remove('show');
            enableEditMode();
            // alert('Login realizado com sucesso! Modo de edição ativo.'); // Removed alert to be less intrusive
        } else {
            alert('Credenciais inválidas.');
        }
    });

    // ---- 3. EDIT MODE & STATE MANAGEMENT ----
    function enableEditMode() {
        document.body.classList.add('admin-logged-in');

        // Update Admin UI
        adminLock.innerHTML = '<i class="fas fa-unlock"></i>';
        adminLock.style.color = '#4CAF50';
        adminLock.title = "Admin Logado (Clique para Sair)";

        // Create Admin Toolbar if not exists
        if (!document.getElementById('admin-toolbar')) {
            const toolbar = document.createElement('div');
            toolbar.id = 'admin-toolbar';

            // Add Project Button
            const newAddBtn = document.createElement('button');
            newAddBtn.className = 'admin-btn primary';
            newAddBtn.innerHTML = '<i class="fas fa-plus"></i> Novo Projeto';
            newAddBtn.onclick = addProject;
            toolbar.appendChild(newAddBtn);

            // Export Button
            const exportBtn = document.createElement('button');
            exportBtn.className = 'admin-btn';
            exportBtn.innerHTML = '<i class="fas fa-download"></i> Baixar HTML';
            exportBtn.onclick = exportHTML;
            toolbar.appendChild(exportBtn);

            // Logout Button
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'admin-btn danger';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
            logoutBtn.onclick = logout;
            toolbar.appendChild(logoutBtn);

            document.body.appendChild(toolbar);
        }

        // Make elements editable
        document.querySelectorAll('.editable').forEach(el => {
            el.classList.add('edit-active');
            el.addEventListener('dblclick', function () {
                if (!document.body.classList.contains('admin-logged-in')) return;
                this.contentEditable = true;
                this.focus();
            });
            el.addEventListener('blur', function () {
                this.contentEditable = false;
                saveContent();
            });
        });

        // Add Project Card Editing Listeners
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', handleProjectClick);
        });

        saveContent();
    }

    function disableEditMode() {
        document.body.classList.remove('admin-logged-in');

        adminLock.innerHTML = '<i class="fas fa-lock"></i>';
        adminLock.style.color = '';
        adminLock.title = "Admin Login";

        const toolbar = document.getElementById('admin-toolbar');
        if (toolbar) toolbar.remove();

        document.querySelectorAll('.editable').forEach(el => {
            el.classList.remove('edit-active');
            el.contentEditable = false;
        });
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY);
        disableEditMode();
        alert('Você saiu do modo de edição.');
    }

    function exportHTML() {
        const clone = document.documentElement.cloneNode(true);
        clone.querySelector('body').classList.remove('admin-logged-in');
        clone.querySelectorAll('.edit-active').forEach(el => el.classList.remove('edit-active'));
        clone.querySelectorAll('#admin-toolbar').forEach(el => el.remove());

        const htmlContent = "<!DOCTYPE html>\n" + clone.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Arquivo index.html baixado!');
    }

    // ---- 4. CONTENT MANAGEMENT ----

    function handleProjectClick(e) {
        if (!document.body.classList.contains('admin-logged-in')) return;
        e.preventDefault();

        const card = this;
        const action = confirm("Deseja EDITAR este projeto? (Cancelar para EXCLUIR)");

        if (action) {
            const currentLink = card.getAttribute('href');
            const currentImg = card.querySelector('img').getAttribute('src');
            const currentTitle = card.querySelector('.card-title').innerText;
            const currentCategory = card.querySelector('.card-category').innerText;
            const currentYear = card.querySelector('.card-year').innerText;

            const newTitle = prompt("Título:", currentTitle);
            const newCategory = prompt("Categoria:", currentCategory);
            const newYear = prompt("Ano:", currentYear);
            const newImg = prompt("Imagem:", currentImg);
            const newLink = prompt("PDF:", currentLink);

            if (newTitle) card.querySelector('.card-title').innerText = newTitle;
            if (newCategory) card.querySelector('.card-category').innerText = newCategory;
            if (newYear) card.querySelector('.card-year').innerText = newYear;
            if (newImg) card.querySelector('img').setAttribute('src', newImg);
            if (newLink) card.setAttribute('href', newLink);

            saveContent();
        } else {
            if (confirm("EXCLUIR este projeto?")) {
                card.remove();
                saveContent();
            }
        }
    }

    function addProject() {
        const title = prompt("Título:");
        if (!title) return;

        const category = prompt("Categoria:", "Design");
        const year = prompt("Ano:", "2024");
        const img = prompt("Imagem Path:", "assets/faculdade/...");
        const link = prompt("PDF Path:", "#");

        const gallery = document.getElementById('project-gallery');
        const newCard = document.createElement('a');
        newCard.href = link;
        newCard.target = "_blank";
        newCard.className = "project-card animate-up in-view";
        newCard.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${img}" alt="${title}">
            </div>
            <div class="card-content">
                <div class="card-header">
                    <span class="card-category">${category}</span>
                    <span class="card-year">${year}</span>
                </div>
                <h3 class="card-title">${title}</h3>
            </div>
        `;

        newCard.addEventListener('click', handleProjectClick);
        gallery.prepend(newCard);
        saveContent();
    }

    function saveContent() {
        const data = {};
        document.querySelectorAll('[data-key]').forEach(el => {
            data[el.dataset.key] = el.innerHTML;
        });
        const gallery = document.getElementById('project-gallery');
        if (gallery) data['project-gallery-html'] = gallery.innerHTML;
        localStorage.setItem(CONTENT_KEY, JSON.stringify(data));
    }

    function loadSavedContent() {
        const data = JSON.parse(localStorage.getItem(CONTENT_KEY));
        if (!data) return;
        document.querySelectorAll('[data-key]').forEach(el => {
            if (data[el.dataset.key]) el.innerHTML = data[el.dataset.key];
        });
        const gallery = document.getElementById('project-gallery');
        if (gallery && data['project-gallery-html']) {
            gallery.innerHTML = data['project-gallery-html'];
            gallery.querySelectorAll('.project-card').forEach(card => {
                card.addEventListener('click', handleProjectClick);
            });
        }
    }
});
