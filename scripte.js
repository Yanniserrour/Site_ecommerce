//ceci est fait pour translate entre les pages inscription et connexion
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

if (container && registerBtn && loginBtn) {
    registerBtn.addEventListener('click', () => {
        container.classList.add("active");
    });

    loginBtn.addEventListener('click', () => {
        container.classList.remove("active");
    });
}

// Sidebar Menu Toggle
const burgerMenuBtn = document.getElementById('burgerMenuBtn');
const sidebarMenu = document.getElementById('sidebarMenu');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const accountBtn = document.getElementById('accountBtn');

// Open sidebar
if (burgerMenuBtn) {
    burgerMenuBtn.addEventListener('click', () => {
        sidebarMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// Close sidebar
if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', () => {
        sidebarMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (sidebarMenu && sidebarMenu.classList.contains('active')) {
        if (!sidebarMenu.contains(e.target) && !burgerMenuBtn.contains(e.target)) {
            sidebarMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
});

// Close sidebar when clicking on a nav link
const sidebarLinks = document.querySelectorAll('.sidebar-link');
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        sidebarMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Account button functionality
if (accountBtn) {
    accountBtn.addEventListener('click', () => {
        const isLoggedIn = localStorage.getItem('userLoggedIn');
        if (isLoggedIn === 'true') {
            window.location.href = 'profile.html';
        } else {
            window.location.href = 'auth.html';
        }
    });
}

// Check if user is logged in and update account button
window.addEventListener('load', () => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const userName = localStorage.getItem('userName');
    const accountText = document.getElementById('accountText');
    const accountIcon = document.querySelector('.account-icon');
    
    if (isLoggedIn === 'true' && userName && accountText) {
        accountText.textContent = userName;
    }
});