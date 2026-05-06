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

// Gestion de la page panier
const panierItems = document.getElementById('panierItems');
const panierTotal = document.getElementById('panierTotal');
const panierEmpty = document.getElementById('panierEmpty');
const panierConfirmLink = document.getElementById('panierConfirmLink');
const panierProfileBtn = document.getElementById('panierProfileBtn');

// Transformer le texte du prix en nombre utilisable
function getPrixValue(text) {
    const cleaned = text.replace(/\s/g, '').replace(',', '.');
    const value = parseFloat(cleaned);
    return Number.isNaN(value) ? 0 : value;
}

// Mettre a jour le total et l'etat du panier
function updatePanier() {
    const rows = Array.from(panierItems.querySelectorAll('tr'));
    const total = rows.reduce((sum, row) => {
        const prix = row.querySelector('.prix');
        return sum + getPrixValue(prix ? prix.textContent : '0');
    }, 0);

    panierTotal.textContent = total.toLocaleString('fr-DZ') + ' DA';
    panierEmpty.classList.toggle('active', rows.length === 0);
    panierConfirmLink.classList.toggle('disabled', rows.length === 0);
}

if (panierItems && panierTotal && panierEmpty && panierConfirmLink) {
    // Supprimer un produit du panier
    panierItems.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.panier-delete');

        if (deleteBtn) {
            deleteBtn.closest('tr').remove();
            updatePanier();
        }
    });

    // Empecher la commande si le panier est vide
    panierConfirmLink.addEventListener('click', (event) => {
        if (panierConfirmLink.classList.contains('disabled')) {
            event.preventDefault();
        }
    });

    updatePanier();
}

if (panierProfileBtn) {
    // Rediriger vers le profil ou la connexion depuis le panier
    panierProfileBtn.addEventListener('click', () => {
        const isLoggedIn = localStorage.getItem('userLoggedIn');
        window.location.href = isLoggedIn === 'true' ? 'profile.html' : 'auth.html';
    });
}

const adminProductForm = document.getElementById('adminProductForm');
const adminProductsList = document.getElementById('adminProductsList');
const adminOrdersList = document.getElementById('adminOrdersList');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

if (adminProductForm && adminProductsList) {
    adminProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const productName = document.getElementById('adminProductName').value.trim();
        const productCategory = document.getElementById('adminProductCategory').value.trim();
        const productPrice = document.getElementById('adminProductPrice').value.trim();

        if (!productName || !productCategory || !productPrice) {
            return;
        }

        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const categoryCell = document.createElement('td');
        const priceCell = document.createElement('td');
        const actionCell = document.createElement('td');
        const deleteBtn = document.createElement('button');

        nameCell.textContent = productName;
        categoryCell.textContent = productCategory;
        priceCell.textContent = Number(productPrice).toLocaleString('fr-DZ') + ' DA';
        deleteBtn.className = 'admin-delete-product';
        deleteBtn.type = 'button';
        deleteBtn.textContent = 'Supprimer';

        actionCell.appendChild(deleteBtn);
        row.append(nameCell, categoryCell, priceCell, actionCell);

        adminProductsList.appendChild(row);
        adminProductForm.reset();
    });

    adminProductsList.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.admin-delete-product');

        if (deleteBtn) {
            deleteBtn.closest('tr').remove();
        }
    });
}

if (adminOrdersList) {
    adminOrdersList.addEventListener('click', (event) => {
        const statusBtn = event.target.closest('.admin-order-status');

        if (statusBtn) {
            statusBtn.textContent = statusBtn.textContent === 'En attente' ? 'Validee' : 'En attente';
            statusBtn.classList.toggle('active');
        }
    });
}

if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userName');
        window.location.href = 'auth.html';
    });
}
