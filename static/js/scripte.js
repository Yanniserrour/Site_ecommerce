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
const accountBtn = document.getElementById('accountBtn');

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

// Account button functionality
if (accountBtn) {
    accountBtn.addEventListener('click', (e) => {
        // If the element is an anchor with an href, let the default navigation occur
        const isAnchor = accountBtn.tagName && accountBtn.tagName.toLowerCase() === 'a';
        const isLoggedIn = localStorage.getItem('userLoggedIn');

        if (isLoggedIn === 'true') {
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userName');
            window.location.href = 'profile.html';
            return;
        }

        if (!isAnchor) {
            // for non-anchor elements, navigate to auth page
            window.location.href = 'auth.html';
        }
        // if it's an anchor, allow its href (auth.html) to handle navigation
    });
}

// Check if user is logged in and update account button
window.addEventListener('load', () => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const userName = localStorage.getItem('userName');
    const accountText = document.getElementById('accountText');
    const accountIcon = document.querySelector('.account-icon');
    const accountName = document.getElementById('account-nom');
    
    if (isLoggedIn === 'true' && userName && accountText) {
    accountText.textContent = 'SE DECONNECTER';
    accountName.textContent = userName;
    } 
    else {
        if(accountText) accountText.textContent = 'SE CONNECTER';
        if(accountName) accountName.textContent = 'PROFIL';
    }

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
        welcomeVideo.play().catch(() => {
            // autoplay may be blocked, but video will still show if the browser allows it
        });
    }
});

//Bloquage de panier et profil
const linkPanier = document.getElementById('linkPanier');
const linkProfil = document.getElementById('linkProfil');

if (linkPanier) {
    linkPanier.addEventListener('click', function(e) {
        if (localStorage.getItem('userLoggedIn') !== 'true') {
            e.preventDefault();
            window.location.href = 'auth.html';
        }
    });
}

if (linkProfil) {
    linkProfil.addEventListener('click', function(e) {
        if (localStorage.getItem('userLoggedIn') !== 'true') {
            e.preventDefault();
            window.location.href = 'auth.html';
        }
    });
}

// Les deux en meme temps
var currentSearch = '';
var currentCategory = '';
var currentLangue = '';

function applyFilters() {
    var books = document.querySelectorAll('.produit-book, .index-book');

    books.forEach(function(book) {
        var p = book.querySelector('p');
        if (!p) return;

        var parts = p.innerHTML.split('<br>');
        var title = (parts[0] || '').trim().toLowerCase();

        var matchSearch = !currentSearch || title.includes(currentSearch.toLowerCase());

        var matchCategory = true;
        var matchLangue = true;

        if (book.classList.contains('produit-book')) {
            matchCategory = !currentCategory || (book.dataset.category || '') === currentCategory;
            matchLangue = !currentLangue || (book.dataset.langue || '') === currentLangue;
        }

        if (matchSearch && matchCategory && matchLangue) {
            book.style.display = '';
        } else {
            book.style.display = 'none';
        }
    });
}

// Barre de recherche
var searchInput = document.querySelector('.search-input');
var searchBtn = document.querySelector('.search-btn');

if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        currentSearch = searchInput.value.trim();
        applyFilters();
    });
}

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

// Gestion de la page panier
const panierItems = document.getElementById('panierItems');
const panierTotal = document.getElementById('panierTotal');
const panierEmpty = document.getElementById('panierEmpty');
const panierConfirmLink = document.getElementById('panierConfirmLink');
const panierProfileBtn = document.getElementById('panierProfileBtn');
const cartItemsKey = 'adlisCartItems';
const adminOrdersKey = 'adlisOrders';

function getStoredItems(key) {
    const savedItems = localStorage.getItem(key);

    if (!savedItems) {
        return [];
    }

    try {
        return JSON.parse(savedItems);
    } catch (error) {
        return [];
    }
}

function saveStoredItems(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
}

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

function createPanierRow(item) {
    const row = document.createElement('tr');
    const infoCell = document.createElement('td');
    const priceCell = document.createElement('td');
    const actionCell = document.createElement('td');
    const title = document.createElement('strong');
    const deleteBtn = document.createElement('button');

    row.dataset.cartId = item.id;
    title.textContent = 'Categorie : ' + (item.category || 'X');
    infoCell.append(
        title,
        document.createElement('br'),
        item.title || '',
        document.createElement('br'),
        item.author || ''
    );
    priceCell.className = 'prix';
    priceCell.textContent = item.price || '0 DA';
    deleteBtn.className = 'panier-delete';
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Supprimer';
    actionCell.appendChild(deleteBtn);
    row.append(infoCell, priceCell, actionCell);

    return row;
}

function renderPanierItems() {
    if (!panierItems) {
        return;
    }

    panierItems.innerHTML = '';

    getStoredItems(cartItemsKey).forEach((item) => {
        panierItems.appendChild(createPanierRow(item));
    });
}

if (panierItems && panierTotal && panierEmpty && panierConfirmLink) {
    renderPanierItems();

    // Supprimer un produit du panier
    panierItems.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.panier-delete');

        if (deleteBtn) {
            const row = deleteBtn.closest('tr');
            const cartId = row.dataset.cartId;

            saveStoredItems(
                cartItemsKey,
                getStoredItems(cartItemsKey).filter((item) => item.id !== cartId)
            );
            row.remove();
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

const commandeForm = document.getElementById('commandeForm');

if (commandeForm) {
    commandeForm.querySelectorAll('input, select').forEach((field) => {
        field.required = true;
    });
}

const adminProductForm = document.getElementById('adminProductForm');
const adminProductsList = document.getElementById('adminProductsList');
const adminOrdersList = document.getElementById('adminOrdersList');
const adminOrdersTotal = document.getElementById('adminOrdersTotal');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminProductsKey = 'adlisAdminBooks';
const adminProductsMaxCount = 5;

function getAdminProducts() {
    const savedProducts = localStorage.getItem(adminProductsKey);

    if (!savedProducts) {
        return [];
    }

    try {
        return JSON.parse(savedProducts);
    } catch (error) {
        return [];
    }
}

function saveAdminProducts(products) {
    localStorage.setItem(adminProductsKey, JSON.stringify(products));
}

function formatAdminPrice(price) {
    return Number(price).toLocaleString('fr-DZ') + ' DA';
}

function updateAdminOrdersTotal() {
    if (!adminOrdersList || !adminOrdersTotal) {
        return;
    }

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
    if (!adminOrdersList) {
        return;
    }

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

function createAdminProductRow(product) {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const categoryCell = document.createElement('td');
    const priceCell = document.createElement('td');
    const actionCell = document.createElement('td');
    const deleteBtn = document.createElement('button');

    row.dataset.productId = product.id;
    nameCell.textContent = product.name;
    categoryCell.textContent = product.category;
    priceCell.textContent = formatAdminPrice(product.price);
    deleteBtn.className = 'admin-delete-product';
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Supprimer';

    actionCell.appendChild(deleteBtn);
    row.append(nameCell, categoryCell, priceCell, actionCell);

    return row;
}

function renderAdminProductsList() {
    if (!adminProductsList) {
        return;
    }

    adminProductsList.innerHTML = '';

    getAdminProducts().forEach((product) => {
        adminProductsList.appendChild(createAdminProductRow(product));
    });
}

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

function renderDynamicBooks() {
    const products = getAdminProducts();
    const produitGrid = document.querySelector('.produit-grid');
    const recentGallery = document.getElementById('recentBooksGallery') || document.querySelector('.index-autre-gallery:last-of-type');

    if (produitGrid) {
        produitGrid.querySelectorAll('.admin-dynamic-book').forEach((book) => book.remove());
        products.slice().reverse().forEach((product) => {
            produitGrid.prepend(createBookElement(product, 'produit-book'));
        });
    }

    if (recentGallery) {
        recentGallery.querySelectorAll('.admin-dynamic-book').forEach((book) => book.remove());
        products.slice(0, 5).reverse().forEach((product) => {
            recentGallery.prepend(createBookElement(product, 'index-book'));
        });
    }
}

//Filtrer par categorie
document.querySelectorAll('.category-filter').forEach(function(filter) {
    filter.addEventListener('click', function() {
        document.querySelectorAll('.category-filter').forEach(function(f) {
            f.classList.remove('active-filter');
        });
        filter.classList.add('active-filter');

        var selectedCategory = filter.textContent.trim();
        var allBooks = document.querySelectorAll('.produit-book');
        if (filter.classList.contains('category-reset')) {
            allBooks.forEach(function(book) {
                book.style.display = '';
            });
            return;
        }
        allBooks.forEach(function(book) {
            if (book.dataset.category === selectedCategory) {
                book.style.display = '';
            } else {
                book.style.display = 'none';
            }
        });
    });
});


//Filtrer par langue:
document.querySelectorAll('.langue-filter').forEach(function(filter) {
    filter.addEventListener('click', function() {
        document.querySelectorAll('.langue-filter').forEach(function(f) {
            f.classList.remove('active-filter');
        });
        filter.classList.add('active-filter');

        var selectedLangue = filter.textContent.trim();
        var allBooks = document.querySelectorAll('.produit-book');
        if (filter.classList.contains('langue-reset')) {
            allBooks.forEach(function(book) {
                book.style.display = '';
            });
            return;
        }
        allBooks.forEach(function(book) {
            if (book.dataset.langue === selectedLangue) {
                book.style.display = '';
            } else {
                book.style.display = 'none';
            }
        });
    });
});

if (adminProductForm && adminProductsList) {
    renderAdminProductsList();

    adminProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const productName = document.getElementById('adminProductName').value.trim();
        const productAuthor = document.getElementById('adminProductAuthor').value.trim();
        const productCategory = document.getElementById('adminProductCategory').value.trim();
        const productLanguage = document.getElementById('adminProductLanguage').value.trim();
        const productPrice = document.getElementById('adminProductPrice').value.trim();
        const productImage = document.getElementById('adminProductImage').files[0];

        if (!productName || !productAuthor || !productCategory || !productPrice) {
            return;
        }

        const saveProduct = (imageSrc) => {
            const products = getAdminProducts();
            const newProduct = {
                id: Date.now().toString(),
                name: productName,
                author: productAuthor,
                category: productCategory,
                language: productLanguage,
                price: productPrice,
                image: imageSrc
            };

            products.unshift(newProduct);
            saveAdminProducts(products.slice(0, adminProductsMaxCount));
            renderAdminProductsList();
            renderDynamicBooks();
            adminProductForm.reset();
        };

        if (productImage) {
            const reader = new FileReader();

            reader.addEventListener('load', () => {
                saveProduct(reader.result);
            });
            reader.readAsDataURL(productImage);
        } else {
            saveProduct('../static/img/logo_englet.png');
        }
    });

    adminProductsList.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.admin-delete-product');

        if (deleteBtn) {
            const row = deleteBtn.closest('tr');
            const productId = row.dataset.productId;

            saveAdminProducts(getAdminProducts().filter((product) => product.id !== productId));
            renderAdminProductsList();
            renderDynamicBooks();
        }
    });
}

renderDynamicBooks();

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

// Page dynamique: 
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
 
modalCartBtn.addEventListener('click', function() {
    modalOverlay.classList.remove('active');
    showConfirmationMessage('Livre ajoute au panier avec succes');
});

if (panierConfirmLink) {
    panierConfirmLink.addEventListener('click', function() {
        if (!panierConfirmLink.classList.contains('disabled')) {
            sessionStorage.setItem(confirmationMessageKey, 'Vous pouvez maintenant confirmer votre commande');
        }
    });
}

function openProductModal(bookElement) {
    const img = bookElement.querySelector('img');
    const p = bookElement.querySelector('p');
 
    if (!img || !p) return;
 
    const parts = p.innerHTML.split('<br>');
 
    let title = '';
    let author = '';
    let price = 'X DA';
 
    if (bookElement.classList.contains('produit-book')) {
        title = parts[0] ? parts[0].trim() : '';
        author = parts[1] ? parts[1].replace('Auteur:', '').trim() : '';
        price = parts[2] ? parts[2].replace('Prix:', '').trim() : 'X DA';
    } else {
        title = parts[0] ? parts[0].trim() : '';
        author = parts[1] ? parts[1].trim() : '';
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
        category: 'X',
        price: price
    };
    modalOverlay.classList.add('active');
}
 
document.querySelectorAll('.index-book').forEach(function(book) {
    book.addEventListener('click', function() {
        openProductModal(book);
    });
});


 
document.querySelectorAll('.produit-book').forEach(function(book) {
    book.addEventListener('click', function() {
        openProductModal(book);
    });
});
 
modalCloseBtn.addEventListener('click', function() {
    modalOverlay.classList.remove('active');
});
 
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});

modalCartBtn.addEventListener('click', function() {
    if (selectedProduct) {
        const cartItems = getStoredItems(cartItemsKey);

        cartItems.push({
            id: Date.now().toString(),
            title: selectedProduct.title,
            author: selectedProduct.author,
            category: selectedProduct.category,
            price: selectedProduct.price
        });
        saveStoredItems(cartItemsKey, cartItems);
    }

    modalOverlay.classList.remove('active');
    showConfirmationMessage('Livre ajoute au panier avec succes');
});

if (panierConfirmLink) {
    panierConfirmLink.addEventListener('click', function() {
        if (!panierConfirmLink.classList.contains('disabled')) {
            sessionStorage.setItem(confirmationMessageKey, 'Vous pouvez maintenant confirmer votre commande');
        }
    });
}

const orderForm = document.getElementById('commandeForm');
if (orderForm) {
    orderForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const cartItems = getStoredItems(cartItemsKey);
        if (cartItems.length === 0) {
            showConfirmationMessage('Votre panier est vide.');
            return;
        }

        const inputs = orderForm.querySelectorAll('input[type="text"]');
        const clientName = Array.from(inputs)
            .slice(0, 2)
            .map((field) => field.value.trim())
            .filter(Boolean)
            .join(' ');
        const phone = inputs[3] ? inputs[3].value.trim() : '';

        const existingOrders = getStoredItems(adminOrdersKey);
        const orderProducts = cartItems.map((item) => item.title || 'Produit inconnu').join(', ');
        const orderTotal = cartItems.reduce((sum, item) => sum + getPrixValue(item.price), 0);

        existingOrders.push({
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            client: clientName || 'Client inconnu',
            phone: phone || 'Non renseigné',
            product: orderProducts,
            amount: formatAdminPrice(orderTotal),
            status: 'En attente'
        });

        saveStoredItems(adminOrdersKey, existingOrders);
        saveStoredItems(cartItemsKey, []);
        showConfirmationMessage('Commande confirmée avec succès');
        orderForm.reset();
    });
}

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
