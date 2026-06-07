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
            window.location.href = '/produit?search=' + encodeURIComponent(query);        
        } else {
            currentSearch = query;
            applyFilters();
        }
    });
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
    book.dataset.price = formatAdminPrice(product.price);

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

    // Produit page grid
    const produitGrid = document.querySelector('.produit-grid');
    if (produitGrid) {
        produitGrid.querySelectorAll('.admin-dynamic-book').forEach(function(book) { book.remove(); });
        products.slice().reverse().forEach(function(product) {
            produitGrid.prepend(createBookElement({
                name: product.title,
                author: product.author,
                category: product.category,
                language: product.language,
                price: product.price,
                image: '/static/img/' + product.image
            }, 'produit-book'));
        });
    }

    // Index page categories
    var indexCategories = {
        'Action': document.getElementById('indexAction'),
        'Business': document.getElementById('indexBusiness'),
        'Drama': document.getElementById('indexDrama'),
        'Fiction': document.getElementById('indexFiction'),
        'Roman': document.getElementById('indexRoman')
    };

    Object.keys(indexCategories).forEach(function(category) {
        var gallery = indexCategories[category];
        if (!gallery) return;

        gallery.innerHTML = '';
        var booksInCategory = products.filter(function(p) {
            return p.category === category;
        });

        booksInCategory.slice(-5).forEach(function(product) {
            gallery.appendChild(createBookElement({
                name: product.title,
                author: product.author,
                category: product.category,
                language: product.language,
                price: product.price,
                image: '/static/img/' + product.image
            }, 'index-book'));
        });
    });
    
    if (document.querySelector('.produit-grid')) {
        var urlParams = new URLSearchParams(window.location.search);
        var searchParam = urlParams.get('search');

        if (searchParam && typeof searchInput !== 'undefined') {
            searchInput.value = searchParam;
            currentSearch = searchParam;
            applyFilters();
        }
    }

    applyFilters();
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
    let price = bookElement.dataset.price || 'X DA'; 

    if (bookElement.classList.contains('produit-book')) {
        author = (lines[1] || '').replace('Auteur:', '').trim();
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
        const livres = await loadLivresDb();
        const id_livre = findLivreIdInDb(livres, selectedProduct.title, selectedProduct.author, selectedProduct.price);
        
        ajouterAuPanier(id_livre, selectedProduct.title, selectedProduct.price, selectedProduct.category, selectedProduct.author);
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
            showConfirmationMessage('Ce produit est déjà dans votre panier !');
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
        showConfirmationMessage('Livre ajouté au panier avec succès !');
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

// Pre-remplir le formulaire avec les infos du profil
function prefillFormulaire() {
    if (!commandeForm) return;
    fetch('/api/user/profile', { cache: 'no-store' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.ok) return;
            var u = data.user;
            var iN = commandeForm.querySelector('input[placeholder="Nom"]');
            var iP = commandeForm.querySelector('input[placeholder="Prénom"]');
            var iT = commandeForm.querySelector('input[placeholder="Numéro de téléphone"]');
            if (iN && u.nom && u.nom !== 'Non renseigne') iN.value = u.nom;
            if (iP && u.prenom && u.prenom !== 'Non renseigne') iP.value = u.prenom;
            if (iT && u.num_telephone && u.num_telephone !== '0') iT.value = u.num_telephone;
        })
        .catch(function() {});
}
prefillFormulaire();

if (commandeForm) {
    commandeForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // 1. Verifier que le panier n est pas vide (depuis la DB)
        let panierData = null;
        try {
            const res = await fetch('/api/cart', { method: 'GET', credentials: 'same-origin', cache: 'no-store' });
            panierData = await res.json();
        } catch (e) {
            showConfirmationMessage('Erreur de connexion avec le serveur.');
            return;
        }
        if (!panierData || !panierData.ok || !panierData.items || panierData.items.length === 0) {
            showConfirmationMessage('Votre panier est vide.');
            return;
        }

        // 2. Recuperer la wilaya
        const wilayaSelect = commandeForm.querySelector('select[name="wilaya"]');
        const wilaya = wilayaSelect ? wilayaSelect.value : '';
        if (!wilaya) {
            showConfirmationMessage('Veuillez sélectionner une wilaya.');
            return;
        }

        // 3. Envoyer la commande
        const payload = new FormData();
        payload.append('wilaya', wilaya);

        try {
            const res = await fetch('/commander', {
                method: 'POST',
                body: payload,
                credentials: 'same-origin'
            });
            const data = await res.json();

            if (data.ok) {
                sessionStorage.setItem(confirmationMessageKey, 'Commande confirmée et enregistrée !');
                window.location.href = '/';
            } else {
                showConfirmationMessage('Erreur : ' + (data.error || 'Serveur'));
            }
        } catch (e) {
            showConfirmationMessage('Erreur de connexion avec le serveur.');
        }
    });
}




//=============================ADMIN===================================
const adminProductForm = document.getElementById('adminProductForm');
const adminProductsList = document.getElementById('adminProductsList');
const adminOrdersList = document.getElementById('adminOrdersList');
const adminOrdersTotal = document.getElementById('adminOrdersTotal');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

// Cycle des statuts de commande
const statutsCycle = ['En attente', 'Validée', 'Livrée', 'Annulée'];

function getStatueClass(statue) {
    if (statue === 'Livrée') return 'livree';
    if (statue === 'Validée') return 'validee';
    if (statue === 'Annulée') return 'annulee';
    return 'attente';
}

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
    row.dataset.commandeId = order.id_commande;
    const statue = order.statue || 'En attente';
    row.innerHTML =
        '<td>' + (order.client || '......') + '</td>' +
        '<td>' + (order.telephone || '......') + '</td>' +
        '<td>' + (order.produits || '......') + '</td>' +
        '<td>' + parseFloat(order.prix_total || 0).toLocaleString('fr-DZ') + ' DA</td>' +
        '<td>' + (order.wilaya || '......') + '</td>' +
        '<td><button class="admin-order-status statue-' + getStatueClass(statue) +
        '" type="button" data-id="' + order.id_commande + '">' + statue + '</button></td>';
    return row;
}

// Charge les commandes depuis la DB a chaque appel (connexion / refresh)
async function renderAdminOrdersList() {
    if (!adminOrdersList) return;
    adminOrdersList.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:12px;">Chargement...</td></tr>';
    try {
        const res = await fetch('/api/admin/commandes', { cache: 'no-store' });
        const data = await res.json();
        adminOrdersList.innerHTML = '';
        if (!data.ok || !data.commandes || data.commandes.length === 0) {
            adminOrdersList.innerHTML = '<tr><td colspan="6" class="admin-orders-empty">Aucune commande pour le moment.</td></tr>';
            if (adminOrdersTotal) adminOrdersTotal.textContent = '0 DA';
            return;
        }
        data.commandes.forEach(function(order) {
            adminOrdersList.appendChild(createAdminOrderRow(order));
        });
        updateAdminOrdersTotal();
    } catch (e) {
        adminOrdersList.innerHTML = '<tr><td colspan="6" class="admin-orders-empty">Erreur de chargement des commandes.</td></tr>';
        console.error('Erreur commandes admin:', e);
    }
}

// Charger la liste des produits depuis la DB
async function renderAdminProductsFromDb() {
    if (!adminProductsList) return;
    try {
        const res = await fetch('/api/admin/produits', { cache: 'no-store' });
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
    } catch (e) { console.error('Erreur produits admin:', e); }
}

if (adminProductsList) {
    renderAdminProductsFromDb();
    adminProductsList.addEventListener('click', async function(event) {
        const deleteBtn = event.target.closest('.admin-delete-product');
        if (!deleteBtn) return;
        const row = deleteBtn.closest('tr');
        const productId = row.dataset.productId;
        try {
            const res = await fetch('/api/admin/produit/' + productId, { method: 'DELETE' });
            const data = await res.json();
            if (data.ok) row.remove();
        } catch (e) {}
    });
}

if (adminOrdersList) {
    // Chargement initial depuis la DB
    renderAdminOrdersList();

    // Clic sur le bouton statut : cycle + sauvegarde en DB
    adminOrdersList.addEventListener('click', async function(event) {
        const statusBtn = event.target.closest('.admin-order-status');
        if (!statusBtn) return;
        const idCommande = statusBtn.dataset.id;
        const currentStatue = statusBtn.textContent.trim();
        const nextStatue = statutsCycle[(statutsCycle.indexOf(currentStatue) + 1) % statutsCycle.length];
        try {
            const res = await fetch('/api/admin/commande/' + idCommande + '/statue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statue: nextStatue })
            });
            const data = await res.json();
            if (data.ok) {
                statusBtn.textContent = nextStatue;
                statusBtn.className = 'admin-order-status statue-' + getStatueClass(nextStatue);
                updateAdminOrdersTotal();
            }
        } catch (e) { console.error('Erreur statut:', e); }
    });
}

if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
        window.location.href = '/deconnexion';
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
                document.getElementById('profileTelephone').textContent = (data.user.num_telephone && data.user.num_telephone !== '0') ? data.user.num_telephone : 'Non défini';
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

// Modifier et sauvegarder les données
var saveProfileBtn = document.getElementById('saveProfileBtn');

document.querySelectorAll('.edit-icon').forEach(function(icon) {
    icon.addEventListener('click', function() {
        var fieldId = icon.dataset.field;
        var span = document.getElementById(fieldId);
        if (!span || span.querySelector('input')) return;

        var currentValue = span.textContent.trim();
        var input = document.createElement('input');
        input.type = fieldId === 'profileBirthDate' ? 'date' : 'text';
        input.value = currentValue === 'Non defini' || currentValue === 'Non renseigne' ? '' : currentValue;
        input.className = 'profile-edit-input';

        span.textContent = '';
        span.appendChild(input);
        input.focus();

        if (saveProfileBtn) saveProfileBtn.style.display = 'block';
    });
});

if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function() {
        var nom = document.getElementById('profileNom');
        var prenom = document.getElementById('profilePrenom');
        var birthDate = document.getElementById('profileBirthDate');
        var telephone = document.getElementById('profileTelephone');
        var ville = document.getElementById('profileVille');

        var data = {
            nom: (nom.querySelector('input') ? nom.querySelector('input').value : nom.textContent).trim(),
            prenom: (prenom.querySelector('input') ? prenom.querySelector('input').value : prenom.textContent).trim(),
            date_naissance: (birthDate.querySelector('input') ? birthDate.querySelector('input').value : birthDate.textContent).trim(),
            num_telephone: (telephone.querySelector('input') ? telephone.querySelector('input').value : telephone.textContent).trim(),
            ville: (ville.querySelector('input') ? ville.querySelector('input').value : ville.textContent).trim()
        };

        fetch('/api/user/update_profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(res) { return res.json(); })
        .then(function(result) {
            if (result.ok) {
                showConfirmationMessage('Profil mis a jour !');
                chargerDonneesProfil();
                saveProfileBtn.style.display = 'none';
            } else {
                showConfirmationMessage('Erreur: ' + (result.error || 'Inconnu'));
            }
        })
        .catch(function() {
            showConfirmationMessage('Erreur de connexion');
        });
    });
}

// Historique commandes utilisateur (depuis la DB)
function chargerHistoriqueAchats() {
    fetch('/api/user/commandes', { cache: 'no-store' })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            const tbody = document.getElementById('purchaseHistoryBody');
            if (!tbody) return;
            if (data.ok && data.commandes && data.commandes.length > 0) {
                tbody.innerHTML = '';
                data.commandes.forEach(function(cmd) {
                    const row = tbody.insertRow();
                    row.innerHTML =
                        '<td>' + (cmd.date ? cmd.date.substring(0, 16) : 'N/A') + '</td>' +
                        '<td>' + (cmd.produits || 'N/A') + '</td>' +
                        '<td>' + parseFloat(cmd.prix_total || 0).toFixed(2) + ' DA</td>' +
                        '<td>' + (cmd.wilaya || 'N/A') + '</td>' +
                        '<td><span class="status ' + (cmd.statue_class || 'pending') + '">' + (cmd.statue || 'En attente') + '</span></td>';
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="5">Aucune commande enregistrée.</td></tr>';
            }
        })
        .catch(function(error) {
            console.error('Erreur historique:', error);
            const tbody = document.getElementById('purchaseHistoryBody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="5">Erreur de chargement.</td></tr>';
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