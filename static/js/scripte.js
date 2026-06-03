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
    accountBtn.addEventListener('click', () => {
        const isLoggedIn = localStorage.getItem('userLoggedIn');
        if (isLoggedIn === 'true') {
            window.location.href = '/profile';
        } else {
            window.location.href = '/auth';
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
        window.location.href = isLoggedIn === 'true' ? '/profile' : '/auth';
    });
}

const adminProductForm = document.getElementById('adminProductForm');
const adminProductsList = document.getElementById('adminProductsList');
const adminOrdersList = document.getElementById('adminOrdersList');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminProductsKey = 'adlisAdminBooks';

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
    const indexGalleries = document.querySelectorAll('.index-autre-gallery');
    const recentGallery = indexGalleries[indexGalleries.length - 1];

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

if (adminProductForm && adminProductsList) {
    renderAdminProductsList();

    adminProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const productName = document.getElementById('adminProductName').value.trim();
        const productAuthor = document.getElementById('adminProductAuthor').value.trim();
        const productCategory = document.getElementById('adminProductCategory').value.trim();
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
                price: productPrice,
                image: imageSrc
            };

            products.unshift(newProduct);
            saveAdminProducts(products);
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
        window.location.href = '/auth';
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
        <p class="product-modal-price"></p>
        <button class="product-modal-cart">Ajouter au panier</button>
    </div>
`;
document.body.appendChild(modalOverlay);

const modalImg = modalOverlay.querySelector('.product-modal-img');
const modalTitle = modalOverlay.querySelector('.product-modal-title');
const modalAuthor = modalOverlay.querySelector('.product-modal-author');
const modalPrice = modalOverlay.querySelector('.product-modal-price');
const modalCloseBtn = modalOverlay.querySelector('.product-modal-close');

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
    modalPrice.textContent = price;
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
