// Plusieurs pages
// Sidebar Menu Toggle (index, produit, panier, admin)
const burgerMenuBtn = document.getElementById('burgerMenuBtn');
const sidebarMenu = document.getElementById('sidebarMenu');
const accountBtn = document.getElementById('accountBtn');
const defaultUserAvatar = '/static/img/profil-de-lutilisateur.png';

if (burgerMenuBtn && sidebarMenu) {
    burgerMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebarMenu.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
        if (!sidebarMenu.contains(e.target) && !burgerMenuBtn.contains(e.target)) {
            sidebarMenu.classList.remove('active');
        }
    });
}

// Account button (index, produit, panier, admin)
if (accountBtn && accountBtn.tagName && accountBtn.tagName.toLowerCase() !== 'a') {
    accountBtn.addEventListener('click', () => {
        window.location.href = 'auth.html';
    });
}

// Bloquage de panier et profil (index, produit, panier, admin)
const linkPanier = document.getElementById('linkPanier');
const linkProfil = document.getElementById('linkProfil');

if (linkPanier) {
    // Le serveur gere l acces aux pages sensibles.
}

if (linkProfil) {
    // Le serveur gere l acces au profil.
}

// Message de confirmation (panier, formulaire, produit, index)
const confirmationMessageKey = 'adlisConfirmationMessage';

function showConfirmationMessage(message) {
    let confirmation = document.getElementById('confirmationMessage');

    if (!confirmation) {
        confirmation = document.createElement('div');
        confirmation.id = 'confirmationMessage';
        confirmation.className = 'confirmation-message';
        document.body.appendChild(confirmation);
    }

    confirmation.textContent = message;
    confirmation.classList.add('active');

    clearTimeout(confirmation.hideTimer);
    confirmation.hideTimer = setTimeout(() => {
        confirmation.classList.remove('active');
    }, 2600);
}

window.addEventListener('load', () => {
    const savedMessage = sessionStorage.getItem(confirmationMessageKey);

    if (savedMessage) {
        sessionStorage.removeItem(confirmationMessageKey);
        showConfirmationMessage(savedMessage);
    }
});

// Fonctions utilitaires partagees
const cartItemsKey = 'adlisCartItems';
const adminOrdersKey = 'adlisOrders';
const adminProductsKey = 'adlisAdminBooks';
const adminProductsMaxCount = 5;

function getStoredItems(key) {
    const savedItems = localStorage.getItem(key);
    if (!savedItems) return [];
    try { return JSON.parse(savedItems); } catch (error) { return []; }
}

function saveStoredItems(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
}

function getPrixValue(text) {
    const cleaned = text.replace(/\s/g, '').replace(',', '.');
    const value = parseFloat(cleaned);
    return Number.isNaN(value) ? 0 : value;
}

function formatAdminPrice(price) {
    return Number(price).toLocaleString('fr-DZ') + ' DA';
}

function getAdminProducts() {
    const savedProducts = localStorage.getItem(adminProductsKey);
    if (!savedProducts) return [];
    try { return JSON.parse(savedProducts); } catch (error) { return []; }
}

function saveAdminProducts(products) {
    localStorage.setItem(adminProductsKey, JSON.stringify(products));
}

function calculateAge(birthDateString) {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    if (Number.isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
    return age;
}

// A modifier plus tard, ca verifie si il est connecte
let authChecked = false;
let isLogged = false;

async function checkAuthOnce() {
    if (authChecked) return isLogged;

    try {
        const res = await fetch('/api/cart', { method: 'GET' });
        isLogged = res.ok;
    } catch (e) {
        isLogged = false;
    }

    authChecked = true;
    return isLogged;
}

// DB livre cache (panier, index, produit)
let livresDbCache = null;

async function loadLivresDb() {
    if (livresDbCache) return livresDbCache;
    const res = await fetch('/api/livres', { method: 'GET' });
    const data = await res.json();
    livresDbCache = data && data.livres ? data.livres : [];
    return livresDbCache;
}

function normalizePriceForMatch(p) {
    if (p === null || p === undefined) return '';
    return String(p).replace(/\s/g, '').replace('DA', '').replace(',', '.');
}

function findLivreIdInDb(livres, title, author, priceText) {
    const wantedTitle = (title || '').trim().toLowerCase();
    const wantedAuthor = (author || '').trim().toLowerCase();
    const wantedPrice = normalizePriceForMatch(priceText);
    const prixNum = getPrixValue(priceText);
    const wantedPrice2 = prixNum ? normalizePriceForMatch(String(prixNum)) : wantedPrice;

    for (const l of livres) {
        const t = (l.title || '').trim().toLowerCase();
        const a = (l.author || '').trim().toLowerCase();
        const p = normalizePriceForMatch(l.price);
        if (t === wantedTitle && a === wantedAuthor && (p === wantedPrice || p === wantedPrice2)) return l.id_livre;
    }
    for (const l of livres) {
        const t = (l.title || '').trim().toLowerCase();
        const a = (l.author || '').trim().toLowerCase();
        if (t === wantedTitle && a === wantedAuthor) return l.id_livre;
    }
    return null;
}

// Initialisation au chargement (profile, index)
window.addEventListener('load', () => {

    const welcomeVideo = document.getElementById('welcomeVideo');
    if (welcomeVideo) {
        welcomeVideo.muted = true;
        welcomeVideo.playsInline = true;
        welcomeVideo.setAttribute('playsinline', '');
        welcomeVideo.setAttribute('disablepictureinpicture', '');
        welcomeVideo.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
        welcomeVideo.addEventListener('ended', () => {
            welcomeVideo.pause();
            welcomeVideo.currentTime = welcomeVideo.duration || welcomeVideo.currentTime;
        });
        welcomeVideo.play().catch(() => {});
    }
});


// =================AUTH===============================
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







// Index et produit, recherche et filtres
// Systeme de recherche et filtres combines
var currentSearch = '';
var currentCategory = '';
var currentLangue = '';

function applyFilters() {
    var books = document.querySelectorAll('.produit-book, .index-book');

    books.forEach(function(book) {
        var p = book.querySelector('p');
        if (!p) return;
        var lines = p.innerText.split('\n');
        var title = (lines[0] || '').trim().toLowerCase();
        var matchSearch = !currentSearch || title.includes(currentSearch.toLowerCase());
        var matchCategory = true;
        var matchLangue = true;

        if (book.classList.contains('produit-book')) {
            matchCategory = !currentCategory || (book.dataset.category || '') === currentCategory;
            matchLangue = !currentLangue || (book.dataset.langue || '') === currentLangue;
        }

        book.style.display = (matchSearch && matchCategory && matchLangue) ? '' : 'none';
    });
}

// Barre de recherche (index, produit)
var searchInput = document.querySelector('.search-input');
var searchBtn = document.querySelector('.search-btn');

if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        var query = searchInput.value.trim();

        if (!document.querySelector('.produit-grid')) {
            window.location.href = 'produit.html?search=' + encodeURIComponent(query);
        } else {
            currentSearch = query;
            applyFilters();
        }
    });
}


// Charger la recherche depuis l URL (produit)
if (document.querySelector('.produit-grid')) {
    var urlParams = new URLSearchParams(window.location.search);
    var searchParam = urlParams.get('search');

    if (searchParam && searchInput) {
        searchInput.value = searchParam;
        currentSearch = searchParam;
        applyFilters();
    }
}

// Index, video de bienvenue:
document.addEventListener("DOMContentLoaded", function() {
    const video = document.getElementById("welcomeVideo");

    if (video) {
        video.addEventListener("canplay", function() {
            video.classList.remove("is-hidden");
        });
        if (video.readyState >= 3) {
            video.classList.remove("is-hidden");
        }
    }
});

// Livres dynamiques (index, produit)
function createBookElement(product, className) {
    const book = document.createElement('div');
    const image = document.createElement('img');
    const description = document.createElement('p');

    book.className = className + ' admin-dynamic-book';
    image.src = product.image || '../static/img/logo_englet.png';
    image.alt = product.name;
    book.dataset.category = product.category;
    book.dataset.langue = product.language;

    description.append(
        product.name,
        document.createElement('br'),
        className === 'produit-book' ? 'Auteur: ' + product.author : product.author
    );

    if (className === 'produit-book') {
        description.append(
            document.createElement('br'),
            'Prix: ' + formatAdminPrice(product.price)
        );
    }

    book.append(image, description);
    return book;
}

async function renderDynamicBooks() {
    let products = [];
    try {
        const res = await fetch('/api/livres', { method: 'GET' });
        const data = await res.json();
        if (data && data.ok && data.livres) {
            products = data.livres;
        }
    } catch (e) {
        products = [];
    }

    const produitGrid = document.querySelector('.produit-grid');
    const recentGallery = document.getElementById('recentBooksGallery') || document.querySelector('.index-autre-gallery:last-of-type');

    if (produitGrid) {
        produitGrid.querySelectorAll('.admin-dynamic-book').forEach((book) => book.remove());
        products.slice().reverse().forEach((product) => {
            const book = createBookElement({
                name: product.title,
                author: product.author,
                category: product.category,
                language: product.language,
                price: product.price,
                image: '/static/img/' + product.image
            }, 'produit-book');
            produitGrid.prepend(book);
        });
    }

    if (recentGallery) {
        recentGallery.querySelectorAll('.admin-dynamic-book').forEach((book) => book.remove());
        products.slice(0, 5).reverse().forEach((product) => {
            const book = createBookElement({
                name: product.title,
                author: product.author,
                category: product.category,
                language: product.language,
                price: product.price,
                image: '/static/img/' + product.image
            }, 'index-book');
            recentGallery.prepend(book);
        });
    }
}

renderDynamicBooks();






// ==================PRODUIT============================
const modalOverlay = document.createElement('div');
modalOverlay.className = 'product-modal-overlay';
modalOverlay.innerHTML = `
    <div class="product-modal">
        <button class="product-modal-close">&times;</button>
        <img class="product-modal-img" src="" alt="">
        <h2 class="product-modal-title"></h2>
        <p class="product-modal-author"></p>
        <p class="product-modal-category"></p>
        <p class="product-modal-langue"></p>
        <p class="product-modal-price"></p>
        <button class="product-modal-cart">Ajouter au panier</button>
    </div>
`;
document.body.appendChild(modalOverlay);

const modalImg = modalOverlay.querySelector('.product-modal-img');
const modalTitle = modalOverlay.querySelector('.product-modal-title');
const modalAuthor = modalOverlay.querySelector('.product-modal-author');
const modalCategory = modalOverlay.querySelector('.product-modal-category');
const modalLangue = modalOverlay.querySelector('.product-modal-langue');
const modalPrice = modalOverlay.querySelector('.product-modal-price');
const modalCloseBtn = modalOverlay.querySelector('.product-modal-close');
const modalCartBtn = modalOverlay.querySelector('.product-modal-cart');
let selectedProduct = null;

function openProductModal(bookElement) {
    const img = bookElement.querySelector('img');
    const p = bookElement.querySelector('p');
    if (!img || !p) return;

    const lines = p.innerText.split('\n').map(l => l.trim()).filter(l => l !== '');
    let title = lines[0] || '';
    let author = lines[1] || '';
    let price = 'X DA';

    if (bookElement.classList.contains('produit-book')) {
        author = (lines[1] || '').replace('Auteur:', '').trim();
        price = (lines[2] || '').replace('Prix:', '').trim();
    }

    modalImg.src = img.src;
    modalTitle.textContent = title;
    modalAuthor.textContent = author;
    modalCategory.textContent = 'Categorie: ' + (bookElement.dataset.category || 'X');
    modalLangue.textContent = 'Langue: ' + (bookElement.dataset.langue || 'X');
    modalPrice.textContent = price;
    selectedProduct = {
        title: title,
        author: author,
        category: bookElement.dataset.category || 'X',
        price: price
    };
    modalOverlay.classList.add('active');
}

document.addEventListener('click', function (e) {
    const book = e.target.closest('.index-book, .produit-book');
    if (!book) return;

    openProductModal(book);
});

modalCloseBtn.addEventListener('click', function() {
    modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) modalOverlay.classList.remove('active');
});

modalCartBtn.addEventListener('click', async function() {
    const logged = await checkAuthOnce();

    if (!logged) {
        window.location.href = 'auth.html';
        return;
    }
    if (selectedProduct) {
        const cartItems = getStoredItems(cartItemsKey);
        const existingItem = cartItems.find((item) =>
            item.title === selectedProduct.title &&
            item.author === selectedProduct.author &&
            item.price === selectedProduct.price
        );

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            let id_livre = null;
            try {
                const livres = await loadLivresDb();
                id_livre = findLivreIdInDb(livres, selectedProduct.title, selectedProduct.author, selectedProduct.price);
            } catch (e) {
                id_livre = null;
            }

            cartItems.push({
                id: Date.now().toString(),
                id_livre: id_livre,
                title: selectedProduct.title,
                author: selectedProduct.author,
                category: selectedProduct.category,
                price: selectedProduct.price,
                quantity: 1
            });
        }

        saveStoredItems(cartItemsKey, cartItems);
    }

    modalOverlay.classList.remove('active');
    showConfirmationMessage('Livre ajoute au panier avec succes');
});


// Produit, filtre categorie et langue
// Filtrer par categorie
document.querySelectorAll('.category-filter').forEach(function(filter) {
    filter.addEventListener('click', function() {
        document.querySelectorAll('.category-filter').forEach(function(f) {
            f.classList.remove('active-filter');
        });
        filter.classList.add('active-filter');

        if (filter.classList.contains('category-reset')) {
            currentCategory = '';
        } else {
            currentCategory = filter.textContent.trim();
        }
        applyFilters();
    });
});

// Filtrer par langue
document.querySelectorAll('.langue-filter').forEach(function(filter) {
    filter.addEventListener('click', function() {
        document.querySelectorAll('.langue-filter').forEach(function(f) {
            f.classList.remove('active-filter');
        });
        filter.classList.add('active-filter');

        if (filter.classList.contains('langue-reset')) {
            currentLangue = '';
        } else {
            currentLangue = filter.textContent.trim();
        }
        applyFilters();
    });
});



// ==================== PANIER ====================

// Charger le panier depuis la base de données
function chargerPanier() {
    fetch('/api/cart', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store'
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            afficherPanier(data.items);
        } else if (data.error === 'not_logged_in') {
            window.location.href = '/auth';
        } else {
            console.error('Erreur:', data.error);
            afficherPanier([]);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        afficherPanier([]);
    });
}

// Afficher le panier dans le tableau
function afficherPanier(items) {
    const tbody = document.getElementById('panierItems');
    const emptyMessage = document.getElementById('panierEmpty');
    const totalSpan = document.getElementById('panierTotal');
    
    if (!tbody) return;
    
    if (!items || items.length === 0) {
        tbody.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'block';
        if (totalSpan) totalSpan.textContent = '0 DA';
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';
    
    let total = 0;
    tbody.innerHTML = '';
    
    items.forEach(item => {
        const prix = parseFloat(item.price);
        const quantite = item.quantity || 1;
        const prixLigne = prix * quantite;
        total += prixLigne;
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>
                <strong>${item.category || 'Livre'}</strong><br>
                ${item.title}<br>
                ${item.author || ''}
            </td>
            <td class="quantite-cell">${quantite}</td>
            <td class="prix">${prixLigne.toFixed(2)} DA</td>
            <td>
                <button class="panier-delete" data-id="${item.id_livre}" type="button">Supprimer</button>
            </td>
        `;
    });
    
    if (totalSpan) totalSpan.textContent = total.toFixed(2) + ' DA';
    
    // Ajouter les événements de suppression
    document.querySelectorAll('.panier-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            supprimerDuPanier(this.getAttribute('data-id'));
        });
    });
}

// Supprimer un article du panier
function supprimerDuPanier(idLivre) {
    fetch('/api/cart', {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            const items = data.items.filter(item => item.id_livre != idLivre);
            synchroniserPanier(items);
        }
    })
    .catch(error => console.error('Erreur:', error));
}

// Synchroniser le panier avec la base de données
function synchroniserPanier(items) {
    const cartItems = items.map(item => ({
        id_livre: parseInt(item.id_livre),
        quantity: parseInt(item.quantity) || 1
    }));
    
    fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ items: cartItems })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            chargerPanier();
        } else {
            console.error('Erreur synchronisation:', data.error);
        }
    })
    .catch(error => console.error('Erreur:', error));
}

// Ajouter un produit au panier
function ajouterAuPanier(idLivre, titre, prix, categorie, auteur) {
    fetch('/api/cart', {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        let items = [];
        if (data.ok && data.items) {
            items = data.items;
        }
        
        const existingItem = items.find(item => item.id_livre == idLivre);
        
        if (existingItem) {
            alert("Ce produit est déjà dans votre panier !");
            return;
        }
        
        items.push({
            id_livre: parseInt(idLivre),
            title: titre,
            author: auteur || '',
            price: parseFloat(prix),
            category: categorie || 'Livre',
            quantity: 1
        });
        
        synchroniserPanier(items);
        alert("Produit ajouté au panier !");
    })
    .catch(error => console.error('Erreur:', error));
}

// Charger le panier au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('panierItems')) {
        chargerPanier();
    }
});





//==========================FORMULAIRE================================
const commandeForm = document.getElementById('commandeForm');

if (commandeForm) {
    commandeForm.querySelectorAll('input, select').forEach((field) => {
        field.required = true;
    });

    commandeForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const cartItems = getStoredItems(cartItemsKey);
        if (cartItems.length === 0) {
            showConfirmationMessage('Votre panier est vide.');
            return;
        }

        const inputs = commandeForm.querySelectorAll('input[type="text"]');
        const clientName = Array.from(inputs)
            .slice(0, 2)
            .map((field) => field.value.trim())
            .filter(Boolean)
            .join(' ');
        const phone = inputs[3] ? inputs[3].value.trim() : '';

        const existingOrders = getStoredItems(adminOrdersKey);
        const orderProducts = cartItems.map((item) => {
            const quantity = item.quantity || 1;
            return (item.title || 'Produit inconnu') + ' x' + quantity;
        }).join(', ');
        const orderTotal = cartItems.reduce((sum, item) => {
            const quantity = item.quantity || 1;
            return sum + getPrixValue(item.price) * quantity;
        }, 0);

        existingOrders.push({
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            client: clientName || 'Client inconnu',
            phone: phone || 'Non renseigne',
            product: orderProducts,
            amount: formatAdminPrice(orderTotal),
            status: 'En attente'
        });

        const formData = new FormData(commandeForm);
        if (!formData.has('wilaya') && inputs[2]) {
            formData.append('wilaya', inputs[2].value.trim());
        }

        fetch('/commander', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                saveStoredItems(adminOrdersKey, existingOrders);
                saveStoredItems(cartItemsKey, []);
                showConfirmationMessage('Commande confirmee et enregistree !');
                commandeForm.reset();
            } else {
                showConfirmationMessage('Erreur lors de la commande : ' + (data.error || 'Serveur'));
            }
        })
        .catch(() => {
            showConfirmationMessage('Erreur de connexion avec le serveur');
        });
    });
}






//=============================ADMIN===================================
const adminProductForm = document.getElementById('adminProductForm');
const adminProductsList = document.getElementById('adminProductsList');
const adminOrdersList = document.getElementById('adminOrdersList');
const adminOrdersTotal = document.getElementById('adminOrdersTotal');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

function updateAdminOrdersTotal() {
    if (!adminOrdersList || !adminOrdersTotal) return;

    const total = Array.from(adminOrdersList.querySelectorAll('tr')).reduce((sum, row) => {
        const amountCell = row.querySelector('td:nth-child(4)');
        return sum + getPrixValue(amountCell ? amountCell.textContent : '0');
    }, 0);

    adminOrdersTotal.textContent = total.toLocaleString('fr-DZ') + ' DA';
}

function createAdminOrderRow(order) {
    const row = document.createElement('tr');
    const clientCell = document.createElement('td');
    const phoneCell = document.createElement('td');
    const productCell = document.createElement('td');
    const amountCell = document.createElement('td');
    const statusCell = document.createElement('td');
    const statusBtn = document.createElement('button');

    clientCell.textContent = order.client || '......';
    phoneCell.textContent = order.phone || '......';
    productCell.textContent = order.product || '......';
    amountCell.textContent = order.amount || '0 DA';
    statusBtn.className = 'admin-order-status';
    statusBtn.type = 'button';
    statusBtn.textContent = order.status || 'En attente';
    statusCell.appendChild(statusBtn);
    row.append(clientCell, phoneCell, productCell, amountCell, statusCell);

    return row;
}

function renderAdminOrdersList() {
    if (!adminOrdersList) return;

    const orders = getStoredItems(adminOrdersKey);
    adminOrdersList.innerHTML = '';

    if (orders.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.setAttribute('colspan', '5');
        emptyCell.className = 'admin-orders-empty';
        emptyCell.textContent = 'Aucune commande pour le moment.';
        emptyRow.appendChild(emptyCell);
        adminOrdersList.appendChild(emptyRow);
        adminOrdersTotal.textContent = '0 DA';
        return;
    }

    orders.forEach((order) => {
        adminOrdersList.appendChild(createAdminOrderRow(order));
    });

    updateAdminOrdersTotal();
}

// Charger la liste des produits depuis la DB
async function renderAdminProductsFromDb() {
    if (!adminProductsList) return;
    try {
        const res = await fetch('/api/admin/produits');
        const data = await res.json();
        if (!data.ok) return;

        adminProductsList.innerHTML = '';
        data.produits.forEach(function(product) {
            const row = document.createElement('tr');
            row.dataset.productId = product.id;
            row.innerHTML =
                '<td>' + product.name + '</td>' +
                '<td>' + product.category + '</td>' +
                '<td>' + formatAdminPrice(product.price) + '</td>' +
                '<td><button class="admin-delete-product" type="button">Supprimer</button></td>';
            adminProductsList.appendChild(row);
        });
    } catch (e) {}
}

if (adminProductsList) {
    renderAdminProductsFromDb();

    adminProductsList.addEventListener('click', async function(event) {
        const deleteBtn = event.target.closest('.admin-delete-product');
        if (deleteBtn) {
            const row = deleteBtn.closest('tr');
            const productId = row.dataset.productId;
            try {
                const res = await fetch('/api/admin/produit/' + productId, { method: 'DELETE' });
                const data = await res.json();
                if (data.ok) {
                    row.remove();
                }
            } catch (e) {}
        }
    });
}

if (adminOrdersList) {
    renderAdminOrdersList();

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







//===================== PROFILE============================
// fonction pour les Avatars
var toggleAvatarBox = document.getElementById('toggleAvatarBox');
var avatarBox = document.getElementById('avatarBox');

if (toggleAvatarBox && avatarBox) {
    toggleAvatarBox.addEventListener('click', function() {
        avatarBox.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
        if (!avatarBox.contains(e.target) && !toggleAvatarBox.contains(e.target)) {
            avatarBox.classList.remove('active');
        }
    });
}
// Fonction pour charger les données du profil depuis la base de données
function chargerDonneesProfil() {
    fetch('/api/user/profile')
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                document.getElementById('profileNom').textContent = data.user.nom || 'Non défini';
                document.getElementById('profilePrenom').textContent = data.user.prenom || 'Non défini';
                document.getElementById('profileAge').textContent = data.user.age || 'Non défini';
                document.getElementById('profileBirthDate').textContent = data.user.date_naissance || 'Non défini';
                document.getElementById('profileEmail').textContent = data.user.email || 'Non défini';
                document.getElementById('profileTelephone').textContent = data.user.num_telephone || 'Non défini';
                document.getElementById('profileVille').textContent = data.user.ville || 'Non défini';
                
                // Mettre à jour l'avatar
                if (data.user.avatar) {
                    const avatarImg = document.getElementById('profileAvatar');
                    avatarImg.src = "/static/img/" + data.user.avatar;
                }
            } else {
                console.error('Erreur chargement profil:', data.error);
                afficherErreurProfil();
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            afficherErreurProfil();
        });
}

// Fonction pour charger l'historique des achats
function chargerHistoriqueAchats() {
    fetch('/api/user/purchases')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('purchaseHistoryBody');
            if (data.ok && data.purchases && data.purchases.length > 0) {
                tbody.innerHTML = '';
                data.purchases.forEach(purchase => {
                    const row = tbody.insertRow();
                    row.innerHTML = `
                        <td>${purchase.date || 'N/A'}</td>
                        <td>${purchase.produit || 'N/A'}</td>
                        <td>${purchase.prix || '0'} DA</td>
                        <td><span class="status ${purchase.status_class || 'pending'}">${purchase.status || 'En attente'}</span></td>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="4">Aucun achat enregistré.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            const tbody = document.getElementById('purchaseHistoryBody');
            tbody.innerHTML = '<tr><td colspan="4">Erreur lors du chargement de l\'historique.</td></tr>';
        });
}

// Fonction pour afficher une erreur dans le profil
function afficherErreurProfil() {
    document.getElementById('profileNom').textContent = 'Erreur de chargement';
    document.getElementById('profilePrenom').textContent = 'Erreur de chargement';
    document.getElementById('profileAge').textContent = 'Erreur de chargement';
    document.getElementById('profileBirthDate').textContent = 'Erreur de chargement';
    document.getElementById('profileEmail').textContent = 'Erreur de chargement';
    document.getElementById('profileTelephone').textContent = 'Erreur de chargement';
    document.getElementById('profileVille').textContent = 'Erreur de chargement';
}

// Appeler les fonctions au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    chargerDonneesProfil();
    chargerHistoriqueAchats();
});



