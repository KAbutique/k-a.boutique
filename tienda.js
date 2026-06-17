// ============================================================
// tienda.js - APP PRINCIPAL DE LA TIENDA (CON PERFIL)
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyDRLnS3dcieybMTVqgVJtUuf4E5xBC9HXQ",
    authDomain: "k-a-boutique.firebaseapp.com",
    databaseURL: "https://k-a-boutique-default-rtdb.firebaseio.com",
    projectId: "k-a-boutique",
    storageBucket: "k-a-boutique.firebasestorage.app",
    messagingSenderId: "163536158997",
    appId: "1:163536158997:web:d7f6d2c6481196e489691c",
    measurementId: "G-HKZ2KCQWMF"
};

let firebaseApp, firebaseAuth, firebaseDatabase;
try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firebaseDatabase = firebase.database();
    console.log("✅ Firebase inicializado correctamente");
} catch (e) {
    console.error("❌ Error Firebase:", e);
}

let currentUser = null;
let currentUserData = null; // Datos del perfil del usuario
let allProducts = [];
let cart = [];
let currentCategory = 'all';
let currentReceiptUrl = '';
let cloudinaryWidget = null;
let storeSettings = {
    general: { storeName: 'K\'A Boutique', storeEmail: 'quezadaa382@gmail.com', storePhone: '+593 99 429 8427', storeAddress: 'Av. Principal 123, Ciudad' },
    payment: { methods: { transferencia: true, tarjeta: false, efectivo: false }, bankInfo: 'Banco: Banco Nacional\nCuenta: 123-456789-0\nTitular: K\'A Boutique S.A.' },
    shipping: { cost: 5.00 },
    api: { cloudinaryCloudName: 'djelnkrtm', cloudinaryUploadPreset: 'Depositos', cloudinaryFolder: 'samples/depositos' }
};

try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) cart = JSON.parse(savedCart);
} catch (e) { cart = []; }

// ============================================================
// LISTAS DESPLEGABLES (PAÍSES, PROVINCIAS, CIUDADES)
// ============================================================
const countriesList = [
    { code: 'EC', name: 'Ecuador' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Perú' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'MX', name: 'México' },
    { code: 'ES', name: 'España' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'CA', name: 'Canadá' },
    { code: 'BR', name: 'Brasil' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'PA', name: 'Panamá' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'HN', name: 'Honduras' }
];

const provincesEcuador = [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro',
    'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí',
    'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena',
    'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
];

const citiesByProvince = {
    'Azuay': ['Cuenca', 'Gualaceo', 'Paute', 'Santa Isabel', 'Sigsig'],
    'Pichincha': ['Quito', 'Cayambe', 'Mejía', 'Pedro Moncayo', 'Pedro Vicente Maldonado', 'Puerto Quito', 'Rumiñahui', 'San Miguel de Los Bancos'],
    'Guayas': ['Guayaquil', 'Durán', 'Milagro', 'Quevedo', 'Samborondón', 'Daule', 'Santa Elena'],
    'Manabí': ['Portoviejo', 'Manta', 'Montecristi', 'Jipijapa', 'Chone', 'Bahía de Caráquez'],
    'El Oro': ['Machala', 'Santa Rosa', 'Pasaje', 'Huaquillas', 'Zaruma'],
    'Tungurahua': ['Ambato', 'Baños', 'Pelileo', 'Píllaro'],
    'Cotopaxi': ['Latacunga', 'Saquisilí', 'Pujilí', 'Salcedo'],
    'Chimborazo': ['Riobamba', 'Guano', 'Chambo', 'Alausí'],
    'Imbabura': ['Ibarra', 'Otavalo', 'Cotacachi', 'San Antonio de Ibarra'],
    'Loja': ['Loja', 'Catamayo', 'Macará', 'Zamora'],
    'Carchi': ['Tulcán', 'San Gabriel', 'Montúfar'],
    'Cañar': ['Azogues', 'Biblián', 'La Troncal'],
    'Morona Santiago': ['Macas', 'Gualaquiza', 'Sucúa'],
    'Napo': ['Tena', 'Archidona', 'El Chaco'],
    'Pastaza': ['Puyo', 'Mera', 'Santa Clara'],
    'Zamora Chinchipe': ['Zamora', 'Yantzaza', 'El Pangui'],
    'Bolívar': ['Guaranda', 'San Miguel', 'Chillanes'],
    'Esmeraldas': ['Esmeraldas', 'San Lorenzo', 'Muisne'],
    'Los Ríos': ['Babahoyo', 'Quevedo', 'Ventanas', 'Vinces'],
    'Sucumbíos': ['Nueva Loja', 'Shushufindi', 'Lago Agrio'],
    'Orellana': ['Coca', 'Loreto', 'La Joya de los Sachas'],
    'Santa Elena': ['Santa Elena', 'La Libertad', 'Salinas'],
    'Galápagos': ['Puerto Ayora', 'Puerto Baquerizo Moreno', 'Isabela'],
    'Santo Domingo de los Tsáchilas': ['Santo Domingo']
};

// ============================================================
// CONFIGURACIÓN
// ============================================================
function loadStoreSettings() {
    if (!firebaseDatabase) return Promise.resolve();
    return firebaseDatabase.ref('settings').once('value')
        .then(snapshot => {
            const data = snapshot.val();
            if (data) {
                storeSettings = { ...storeSettings, ...data };
                applySettingsToStore();
            }
            return storeSettings;
        })
        .catch(error => {
            console.error('Error cargando configuraciones:', error);
            return storeSettings;
        });
}

function applySettingsToStore() {
    const general = storeSettings.general || {};
    const shipping = storeSettings.shipping || {};
    const api = storeSettings.api || {};
    document.title = general.storeName || 'K\'A Boutique - Tienda Online';
    document.getElementById('pageTitle').textContent = general.storeName || 'K\'A Boutique - Tienda Online';
    document.getElementById('storeNameHeader').textContent = general.storeName || 'K\'A Boutique';
    document.getElementById('footerStoreName').textContent = general.storeName || 'K\'A Boutique';
    document.getElementById('copyrightName').textContent = general.storeName || 'K\'A Boutique';
    document.getElementById('copyrightYear').textContent = new Date().getFullYear();
    document.getElementById('footerAddress').textContent = general.storeAddress || 'Av. Principal 123, Ciudad';
    document.getElementById('footerPhone').textContent = general.storePhone || '+593 99 429 8427';
    document.getElementById('footerEmail').textContent = general.storeEmail || 'quezadaa382@gmail.com';
    window.shippingCost = shipping.cost !== undefined ? parseFloat(shipping.cost) : 5.00;
    renderPaymentMethods();
    if (api.cloudinaryCloudName && api.cloudinaryUploadPreset) {
        initializeCloudinaryWidget();
    }
}

function renderPaymentMethods() {
    const container = document.getElementById('paymentMethodsContainer');
    if (!container) return;
    const methods = storeSettings.payment?.methods || {};
    let html = '';
    let hasTransfer = false;
    if (methods.transferencia !== false) {
        hasTransfer = true;
        html += `<div class="payment-option active" onclick="selectPayment('transfer')">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="paymentMethod" id="transferPayment" checked>
                <label class="form-check-label fw-bold" for="transferPayment">Transferencia Bancaria</label>
            </div>
            <p class="mb-0 mt-2 text-muted small">Realiza una transferencia a nuestra cuenta bancaria y sube el comprobante.</p>
        </div>`;
    }
    if (methods.tarjeta === true) {
        html += `<div class="payment-option" onclick="selectPayment('card')">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="paymentMethod" id="cardPayment">
                <label class="form-check-label fw-bold" for="cardPayment">Tarjeta de Crédito/Débito</label>
            </div>
            <p class="mb-0 mt-2 text-muted small">Pago seguro con tarjeta (próximamente).</p>
        </div>`;
    }
    if (methods.efectivo === true) {
        html += `<div class="payment-option" onclick="selectPayment('cash')">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="paymentMethod" id="cashPayment">
                <label class="form-check-label fw-bold" for="cashPayment">Efectivo (contra entrega)</label>
            </div>
            <p class="mb-0 mt-2 text-muted small">Paga al recibir tu pedido.</p>
        </div>`;
    }
    container.innerHTML = html;
    const transferInfoDiv = document.getElementById('transferInfo');
    if (transferInfoDiv) {
        transferInfoDiv.style.display = hasTransfer ? 'block' : 'none';
        if (hasTransfer) {
            const bankInfoContent = document.getElementById('bankInfoContent');
            if (bankInfoContent) {
                const bankText = storeSettings.payment?.bankInfo || 'Banco: Banco Nacional\nCuenta: 123-456789-0\nTitular: K\'A Boutique S.A.';
                bankInfoContent.innerHTML = bankText.replace(/\n/g, '<br>');
            }
        }
    }
}

function selectPayment(method) {
    const options = document.querySelectorAll('.payment-option');
    options.forEach(opt => {
        opt.classList.remove('active');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
    });
    event.currentTarget.classList.add('active');
    const radio = event.currentTarget.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
}

// ============================================================
// CLOUDINARY
// ============================================================
function initializeCloudinaryWidget() {
    const cloudName = storeSettings.api?.cloudinaryCloudName || 'djelnkrtm';
    const uploadPreset = storeSettings.api?.cloudinaryUploadPreset || 'Depositos';
    const folder = storeSettings.api?.cloudinaryFolder || 'samples/depositos';
    const cloudinaryConfig = {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ['local', 'camera', 'url'],
        multiple: false,
        maxFileSize: 10485760,
        resourceType: 'auto',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'pdf', 'gif', 'bmp'],
        maxImageWidth: 2000,
        maxImageHeight: 2000,
        cropping: false,
        showAdvancedOptions: false,
        folder: folder,
        tags: ['depositos', 'comprobantes', 'pagos']
    };
    try {
        cloudinaryWidget = cloudinary.createUploadWidget(cloudinaryConfig, function(error, result) {
            if (error) {
                console.error('Cloudinary Error:', error);
                showStatus('Error al subir el comprobante: ' + error.message, 'danger');
                return;
            }
            if (result && result.event === 'success') {
                currentReceiptUrl = result.info.secure_url;
                document.getElementById('cloudinaryReceiptUrl').value = currentReceiptUrl;
                const preview = document.getElementById('receiptPreview');
                if (result.info.resource_type === 'image') {
                    preview.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle me-2"></i> Comprobante subido exitosamente</div>
                        <img src="${currentReceiptUrl}" class="img-fluid rounded mt-2" style="max-height:150px;" alt="Comprobante">
                        <button class="btn btn-sm btn-outline-danger mt-2" onclick="removeReceipt()"><i class="fas fa-trash me-1"></i> Eliminar</button>`;
                } else {
                    preview.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle me-2"></i> Archivo subido exitosamente</div>
                        <button class="btn btn-sm btn-outline-danger mt-2" onclick="removeReceipt()"><i class="fas fa-trash me-1"></i> Eliminar</button>`;
                }
                showStatus('Comprobante subido correctamente', 'success');
            }
        });
        console.log('Cloudinary Widget inicializado');
    } catch (error) {
        console.error('Error inicializando Cloudinary:', error);
    }
}

function openCloudinaryUpload() {
    if (!cloudinaryWidget) {
        showStatus('Error: Widget de Cloudinary no disponible', 'danger');
        return;
    }
    cloudinaryWidget.open();
}

function removeReceipt() {
    currentReceiptUrl = '';
    document.getElementById('cloudinaryReceiptUrl').value = '';
    document.getElementById('receiptPreview').innerHTML = '';
    showStatus('Comprobante eliminado', 'info');
}

// ============================================================
// PRODUCTOS
// ============================================================
function loadProducts() {
    console.log('🔄 Cargando productos desde Firebase...');
    if (!firebaseDatabase) {
        console.error('❌ Firebase Database no disponible');
        showStatus('Error: No hay conexión a la base de datos', 'danger');
        return;
    }
    showLoading('Cargando productos...');
    firebaseDatabase.ref('products').once('value')
        .then(snapshot => {
            console.log('✅ Datos recibidos de Firebase:', snapshot.exists() ? 'Hay datos' : 'Sin datos');
            const data = snapshot.val();
            allProducts = [];
            if (data) {
                Object.keys(data).forEach(key => {
                    const product = data[key];
                    if (product.available !== false) {
                        allProducts.push({ key, ...product });
                    }
                });
            }
            console.log(`✅ ${allProducts.length} productos cargados`);
            hideLoading();
            updateCategoryCounts();
            filterProducts();
            if (allProducts.length === 0) {
                showStatus('No hay productos disponibles. Contacta al administrador.', 'info');
            }
        })
        .catch(error => {
            console.error('❌ Error cargando productos:', error);
            hideLoading();
            let msg = 'Error al cargar productos: ';
            if (error.code === 'PERMISSION_DENIED') {
                msg += 'No tienes permisos para leer productos. Verifica las reglas de Firebase.';
            } else {
                msg += error.message;
            }
            showStatus(msg, 'danger');
            document.getElementById('productsContainer').innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h4>Error al cargar productos</h4>
                    <p class="text-muted">${msg}</p>
                    <button class="btn btn-primary mt-3" onclick="loadProducts()">
                        <i class="fas fa-redo me-2"></i> Reintentar
                    </button>
                </div>`;
        });
}

function updateCategoryCounts() {
    const jewels = allProducts.filter(p => p.category === 'Joyas').length;
    const clothing = allProducts.filter(p => p.category === 'Vestimenta').length;
    const perfumes = allProducts.filter(p => p.category === 'Perfumes').length;
    document.getElementById('jewelsCountBadge').innerHTML = `<span class="badge bg-light text-dark">${jewels} productos</span>`;
    document.getElementById('clothingCountBadge').innerHTML = `<span class="badge bg-light text-dark">${clothing} productos</span>`;
    document.getElementById('perfumesCountBadge').innerHTML = `<span class="badge bg-light text-dark">${perfumes} productos</span>`;
}

function filterProducts() {
    let filtered = [...allProducts];
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    const statusFilter = document.getElementById('filterByStatus').value;
    if (statusFilter === 'sale') filtered = filtered.filter(p => p.onSale === true);
    else if (statusFilter === 'new') filtered = filtered.filter(p => p.new === true);
    const sortBy = document.getElementById('sortProducts').value;
    if (sortBy === 'price_asc') {
        filtered.sort((a, b) => (a.onSale && a.salePrice ? a.salePrice : a.price) - (b.onSale && b.salePrice ? b.salePrice : b.price));
    } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => (b.onSale && b.salePrice ? b.salePrice : b.price) - (a.onSale && a.salePrice ? a.salePrice : a.price));
    } else if (sortBy === 'name_asc') {
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
        filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    renderProducts(filtered);
}

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    const noProducts = document.getElementById('noProductsMessage');
    if (!products || products.length === 0) {
        container.innerHTML = '';
        noProducts.style.display = 'block';
        return;
    }
    noProducts.style.display = 'none';
    let html = '';
    products.forEach(product => {
        const image = product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300x200?text=Sin+imagen';
        const price = product.onSale && product.salePrice ? product.salePrice : (product.price || 0);
        const originalPrice = product.onSale && product.salePrice ? (product.price || 0) : null;
        const inCart = cart.some(item => item.id === product.key);
        const stock = product.stock || 0;
        html += `
            <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                <div class="card product-card h-100">
                    <div class="position-relative">
                        <img src="${image}" class="card-img-top product-img" alt="${product.name || 'Producto'}" onerror="this.src='https://via.placeholder.com/300x200?text=Error+imagen'">
                        <div class="position-absolute top-0 end-0 p-2">
                            ${product.onSale ? '<span class="badge badge-sale me-1">Oferta</span>' : ''}
                            ${product.new ? '<span class="badge badge-new">Nuevo</span>' : ''}
                            ${stock <= 0 ? '<span class="badge bg-secondary">Agotado</span>' : ''}
                        </div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name || 'Producto sin nombre'}</h5>
                        <p class="card-text text-muted small flex-grow-1">${product.description ? product.description.substring(0,80) + (product.description.length > 80 ? '...' : '') : 'Sin descripción'}</p>
                        <div class="mb-2">
                            <span class="badge bg-light text-dark">${product.category || 'Sin categoría'}</span>
                            ${stock > 0 ? `<span class="badge bg-info text-white ms-1">${stock} uds.</span>` : ''}
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <div>${originalPrice ? `<span class="product-price sale-price">$${price.toFixed(2)}</span> <small class="original-price ms-1">$${originalPrice.toFixed(2)}</small>` : `<span class="product-price">$${price.toFixed(2)}</span>`}</div>
                        </div>
                        <div class="d-flex justify-content-between mt-3">
                            <button class="btn btn-sm btn-outline-primary w-100 me-1" onclick="viewProductDetails('${product.key}')"><i class="fas fa-eye me-1"></i> Ver</button>
                            <button class="btn btn-sm ${inCart ? 'btn-success' : 'btn-primary'} w-100 ms-1" onclick="${inCart ? 'removeFromCart(\'' + product.key + '\')' : 'addToCart(\'' + product.key + '\')'}" ${stock <= 0 && !inCart ? 'disabled' : ''}>
                                <i class="fas ${inCart ? 'fa-check' : 'fa-cart-plus'} me-1"></i> ${inCart ? 'En Carrito' : (stock <= 0 ? 'Agotado' : 'Agregar')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

// ============================================================
// CATEGORÍAS
// ============================================================
function loadCategory(category, element) {
    currentCategory = category;
    document.querySelectorAll('#categoryNav .nav-link').forEach(link => link.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    } else {
        document.querySelectorAll('#categoryNav .nav-link').forEach(link => {
            const text = link.textContent.trim();
            if (text === 'Inicio' && category === 'all') link.classList.add('active');
            else if (text === category) link.classList.add('active');
        });
    }
    const titles = {
        'all': 'Productos Destacados',
        'Joyas': 'Joyas',
        'Vestimenta': 'Vestimenta',
        'Perfumes': 'Perfumes',
        'Accesorios': 'Accesorios'
    };
    document.getElementById('productsSectionTitle').textContent = titles[category] || 'Productos';
    const event = new CustomEvent('categoryChanged', { detail: { category } });
    document.dispatchEvent(event);
    filterProducts();
    document.getElementById('productsContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showHome() { loadCategory('all'); }

function viewProductDetails(productId) {
    const product = allProducts.find(p => p.key === productId);
    if (!product) { showStatus('Producto no encontrado', 'warning'); return; }
    const price = product.onSale && product.salePrice ? product.salePrice : (product.price || 0);
    const originalPrice = product.onSale && product.salePrice ? (product.price || 0) : null;
    let details = '🛍️ ' + product.name + '\n\n';
    details += '💰 Precio: $' + price.toFixed(2) + '\n';
    if (originalPrice) details += '🏷️ Original: $' + originalPrice.toFixed(2) + '\n';
    details += '📦 Stock: ' + (product.stock || 0) + ' unidades\n';
    details += '📂 Categoría: ' + (product.category || 'Sin categoría') + '\n\n';
    details += '📝 ' + (product.description || 'Sin descripción');
    alert(details);
}

// ============================================================
// CARRITO
// ============================================================
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        if (currentUser && firebaseDatabase) {
            firebaseDatabase.ref('userCarts/' + currentUser.uid).set(cart).catch(console.error);
        }
    } catch (e) { console.error('Error guardando carrito:', e); }
}

function loadUserCart() {
    if (!currentUser || !firebaseDatabase) return;
    firebaseDatabase.ref('userCarts/' + currentUser.uid).once('value')
        .then(snapshot => {
            const data = snapshot.val();
            if (data && Array.isArray(data) && data.length > 0) {
                cart = data;
                saveCart();
                updateCartUI();
                filterProducts();
            }
        })
        .catch(console.error);
}

function addToCart(productId) {
    const product = allProducts.find(p => p.key === productId);
    if (!product) { showStatus('Producto no encontrado', 'warning'); return; }
    if (product.stock !== undefined && product.stock <= 0) {
        showStatus('Producto agotado', 'warning');
        return;
    }
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        if (product.stock !== undefined && existing.quantity >= product.stock) {
            showStatus('Stock máximo alcanzado', 'warning');
            return;
        }
        existing.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.onSale && product.salePrice ? product.salePrice : product.price,
            image: product.images && product.images.length > 0 ? product.images[0] : '',
            quantity: 1
        });
    }
    saveCart();
    updateCartUI();
    filterProducts();
    showStatus('Producto agregado al carrito', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    filterProducts();
    showStatus('Producto removido del carrito', 'info');
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const product = allProducts.find(p => p.key === productId);
        if (product && product.stock !== undefined && quantity > product.stock) {
            showStatus('Stock máximo: ' + product.stock + ' unidades', 'warning');
            return;
        }
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
    if (document.getElementById('cartSidebar').classList.contains('open')) {
        updateCartSidebar();
    }
}

function updateCartSidebar() {
    const container = document.getElementById('cartItemsContainer');
    const summary = document.getElementById('cartSummary');
    if (!cart || cart.length === 0) {
        container.innerHTML = `<div class="text-center py-5"><i class="fas fa-shopping-cart fa-4x mb-4 text-muted"></i><h5 class="text-muted">Tu carrito está vacío</h5><p class="text-muted">¡Explora nuestros productos y agrega lo que te guste!</p></div>`;
        summary.style.display = 'none';
        return;
    }
    let html = '';
    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = (item.price || 0) * item.quantity;
        subtotal += itemTotal;
        html += `
            <div class="cart-item mb-3">
                <div class="d-flex">
                    <img src="${item.image || 'https://via.placeholder.com/70x70?text=Sin+imagen'}" class="cart-item-img me-3" alt="${item.name || 'Producto'}" onerror="this.src='https://via.placeholder.com/70x70?text=Error'">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${item.name || 'Producto'}</h6>
                        <p class="mb-1 text-muted small">$${(item.price || 0).toFixed(2)} c/u</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="input-group input-group-sm" style="width:120px;">
                                <button class="btn btn-outline-secondary" type="button" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                                <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                                <button class="btn btn-outline-secondary" type="button" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            </div>
                            <span class="fw-bold">$${itemTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
    const shipping = window.shippingCost || 5.00;
    const total = subtotal + shipping;
    document.getElementById('cartSubtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('cartShipping').textContent = '$' + shipping.toFixed(2);
    document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
    summary.style.display = 'block';
}

function toggleCart() {
    updateCartSidebar();
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('show');
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('show');
}

// ============================================================
// CHECKOUT
// ============================================================
function goToCheckout() {
    if (cart.length === 0) {
        showStatus('Tu carrito está vacío', 'warning');
        return;
    }
    if (!currentUser) {
        closeCart();
        showLoginModal();
        showStatus('Debes iniciar sesión para proceder al pago', 'info');
        return;
    }
    closeCart();
    showCheckoutPage();
}

function showCheckoutPage() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('mainHeader').style.display = 'none';
    document.getElementById('mainFooter').style.display = 'none';
    document.getElementById('checkoutPage').style.display = 'block';
    updateCheckoutSummary();
}

function returnToShop() {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('mainHeader').style.display = 'block';
    document.getElementById('mainFooter').style.display = 'block';
    document.getElementById('checkoutPage').style.display = 'none';
    if (allProducts.length === 0) loadProducts();
}

function updateCheckoutSummary() {
    const container = document.getElementById('checkoutItems');
    let subtotal = 0;
    let html = '';
    cart.forEach(item => {
        const itemTotal = (item.price || 0) * item.quantity;
        subtotal += itemTotal;
        html += `
            <div class="d-flex justify-content-between mb-2">
                <div><span class="fw-bold">${item.name || 'Producto'}</span><br><small class="text-muted">${item.quantity} x $${(item.price || 0).toFixed(2)}</small></div>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>`;
    });
    container.innerHTML = html;
    const shipping = window.shippingCost || 5.00;
    const total = subtotal + shipping;
    document.getElementById('checkoutSubtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('checkoutShipping').textContent = '$' + shipping.toFixed(2);
    document.getElementById('checkoutTotal').textContent = '$' + total.toFixed(2);
}

function completeOrder() {
    if (!currentUser) {
        showStatus('Debes iniciar sesión', 'warning');
        showLoginModal();
        return;
    }
    if (cart.length === 0) {
        showStatus('Tu carrito está vacío', 'warning');
        return;
    }
    const receiptUrl = document.getElementById('cloudinaryReceiptUrl').value;
    if (!receiptUrl) {
        showStatus('Debes subir el comprobante de pago', 'warning');
        return;
    }
    const btn = document.getElementById('completeOrderBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Procesando...';
    showLoading('Procesando tu pedido...');
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const timestamp = Date.now();
    const orderData = {
        orderNumber: orderNumber,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        items: cart.map(item => ({ ...item })),
        subtotal: parseFloat(document.getElementById('checkoutSubtotal').textContent.replace('$', '')) || 0,
        shipping: window.shippingCost || 5.00,
        total: parseFloat(document.getElementById('checkoutTotal').textContent.replace('$', '')) || 0,
        paymentMethod: 'transferencia',
        receiptUrl: receiptUrl,
        receiptCloudinaryInfo: {
            folder: storeSettings.api?.cloudinaryFolder || 'samples/depositos',
            preset: storeSettings.api?.cloudinaryUploadPreset || 'Depositos'
        },
        status: 'pendiente',
        createdAt: timestamp,
        updatedAt: timestamp,
        statusHistory: [{ status: 'pendiente', date: timestamp, note: 'Pedido creado' }]
    };
    firebaseDatabase.ref('orders').push(orderData)
        .then(() => {
            hideLoading();
            cart = [];
            localStorage.removeItem('cart');
            if (currentUser) {
                firebaseDatabase.ref('userCarts/' + currentUser.uid).remove().catch(console.error);
            }
            updateCartUI();
            showStatus('✅ ¡Pedido realizado con éxito! Número: ' + orderNumber, 'success');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check-circle me-2"></i> Confirmar Pedido';
            setTimeout(() => returnToShop(), 3000);
        })
        .catch(error => {
            hideLoading();
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check-circle me-2"></i> Confirmar Pedido';
            console.error('Error guardando orden:', error);
            showStatus('Error al guardar el pedido: ' + error.message, 'danger');
        });
}

// ============================================================
// AUTENTICACIÓN
// ============================================================
function showLoginModal() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('resetPasswordForm').style.display = 'none';
    document.getElementById('authModalTitle').textContent = 'Iniciar Sesión';
    clearAuthErrors();
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    new bootstrap.Modal(document.getElementById('authModal')).show();
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('resetPasswordForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('authModalTitle').textContent = 'Iniciar Sesión';
    clearAuthErrors();
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('resetPasswordForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('authModalTitle').textContent = 'Registrarse';
    clearAuthErrors();
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirmPassword').value = '';
}

function showResetPasswordForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('resetPasswordForm').style.display = 'block';
    document.getElementById('authModalTitle').textContent = 'Recuperar Contraseña';
    clearAuthErrors();
    document.getElementById('resetEmail').value = '';
}

function togglePasswordVisibility(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const icon = input.parentElement.querySelector('.password-toggle i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function loginUser(email, password) {
    if (!firebaseAuth) { showStatus('Firebase no disponible', 'danger'); return; }
    clearAuthErrors();
    showLoading('Iniciando sesión...');
    firebaseAuth.signInWithEmailAndPassword(email, password)
        .then(() => {
            hideLoading();
            bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
            showStatus('✅ Sesión iniciada correctamente', 'success');
            if (cart.length > 0) saveCart();
            // Cargar perfil del usuario
            loadUserProfile();
        })
        .catch(error => {
            hideLoading();
            let msg = 'Error al iniciar sesión';
            switch(error.code) {
                case 'auth/invalid-email': msg = 'Correo electrónico inválido'; showAuthError('loginEmailError', msg); break;
                case 'auth/user-not-found': msg = 'No existe una cuenta con este correo'; showAuthError('loginEmailError', msg); break;
                case 'auth/wrong-password': msg = 'Contraseña incorrecta'; showAuthError('loginPasswordError', msg); break;
                case 'auth/too-many-requests': msg = 'Demasiados intentos. Intenta más tarde'; showGeneralAuthError('loginGeneralError', msg); break;
                default: msg = error.message; showGeneralAuthError('loginGeneralError', msg);
            }
        });
}

function registerUser(name, email, password) {
    if (!firebaseAuth || !firebaseDatabase) {
        showStatus('Firebase no disponible', 'danger');
        return;
    }
    showLoading('Registrando usuario...');
    firebaseAuth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            return user.updateProfile({ displayName: name })
                .then(() => firebaseDatabase.ref('users/' + user.uid).set({
                    name: name,
                    email: user.email,
                    displayName: name,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    role: 'cliente'
                }))
                .then(() => user);
        })
        .then(() => {
            hideLoading();
            bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
            showStatus('✅ Usuario registrado correctamente', 'success');
            if (cart.length > 0) saveCart();
            // Cargar perfil del usuario
            loadUserProfile();
        })
        .catch(error => {
            hideLoading();
            let msg = 'Error al registrar usuario';
            switch(error.code) {
                case 'auth/email-already-in-use': msg = 'Este correo ya está registrado'; showAuthError('registerEmailError', msg); break;
                case 'auth/invalid-email': msg = 'Correo electrónico inválido'; showAuthError('registerEmailError', msg); break;
                case 'auth/weak-password': msg = 'La contraseña es demasiado débil'; showAuthError('registerPasswordError', msg); break;
                default: msg = error.message; showGeneralAuthError('registerGeneralError', msg);
            }
        });
}

function resetPassword(email) {
    if (!firebaseAuth) { showStatus('Firebase no disponible', 'danger'); return; }
    showLoading('Enviando correo de restablecimiento...');
    firebaseAuth.sendPasswordResetEmail(email)
        .then(() => {
            hideLoading();
            showStatus('📧 Se ha enviado un enlace de restablecimiento a tu correo', 'success');
            showLoginForm();
        })
        .catch(error => {
            hideLoading();
            let msg = 'Error al enviar el correo';
            switch(error.code) {
                case 'auth/invalid-email': msg = 'Correo electrónico inválido'; showAuthError('resetEmailError', msg); break;
                case 'auth/user-not-found': msg = 'No existe una cuenta con este correo'; showAuthError('resetEmailError', msg); break;
                default: msg = error.message; showGeneralAuthError('resetGeneralError', msg);
            }
        });
}

function loginWithGoogle() {
    if (!firebaseAuth) { showStatus('Firebase no disponible', 'danger'); return; }
    const provider = new firebase.auth.GoogleAuthProvider();
    showLoading('Iniciando sesión con Google...');
    firebaseAuth.signInWithPopup(provider)
        .then(result => {
            hideLoading();
            bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
            showStatus('✅ Sesión iniciada con Google', 'success');
            if (cart.length > 0) saveCart();
            // Cargar perfil del usuario
            loadUserProfile();
        })
        .catch(error => {
            hideLoading();
            console.error('Error con Google:', error);
            showStatus('Error al iniciar sesión con Google: ' + error.message, 'danger');
        });
}

function logout() {
    if (!firebaseAuth) return;
    firebaseAuth.signOut()
        .then(() => {
            cart = [];
            localStorage.removeItem('cart');
            updateCartUI();
            currentUserData = null;
            showStatus('Sesión cerrada correctamente', 'info');
        })
        .catch(error => showStatus('Error al cerrar sesión: ' + error.message, 'danger'));
}

function updateUserUI() {
    const section = document.getElementById('userAuthSection');
    if (!section) return;
    if (currentUser) {
        const name = currentUser.displayName || currentUser.email.split('@')[0];
        section.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user-circle me-1"></i> ${name}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#" onclick="showEditProfileModal()"><i class="fas fa-user-edit me-2"></i> Mi Perfil</a></li>
                    <li><a class="dropdown-item" href="#" onclick="viewMyOrders()"><i class="fas fa-box me-2"></i> Mis Pedidos</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i> Cerrar Sesión</a></li>
                </ul>
            </div>`;
    } else {
        section.innerHTML = `<button class="btn btn-outline-primary" onclick="showLoginModal()"><i class="fas fa-user me-1"></i> Iniciar Sesión</button>`;
    }
}

// ============================================================
// FUNCIONES DE PERFIL DE USUARIO
// ============================================================

// Cargar los datos del perfil del usuario desde Firebase
function loadUserProfile() {
    if (!currentUser || !firebaseDatabase) return;
    const userRef = firebaseDatabase.ref('users/' + currentUser.uid);
    userRef.once('value')
        .then(snapshot => {
            const data = snapshot.val();
            if (data) {
                currentUserData = data;
                console.log('✅ Perfil de usuario cargado:', currentUserData);
            } else {
                // Si no hay datos, crear un objeto básico
                currentUserData = {
                    name: currentUser.displayName || currentUser.email.split('@')[0],
                    email: currentUser.email,
                    fullName: currentUser.displayName || '',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    identificationType: 'cedula',
                    identification: '',
                    customerType: 'particular',
                    company: '',
                    gender: '',
                    birthdate: '',
                    country: 'EC',
                    state: '',
                    city: '',
                    shippingAddress: '',
                    billingAddress: '',
                    notes: '',
                    newsletter: false,
                    createdAt: Date.now()
                };
                // Guardar estructura inicial
                userRef.set(currentUserData).catch(console.error);
            }
        })
        .catch(error => {
            console.error('Error cargando perfil:', error);
        });
}

// Mostrar modal de edición de perfil
function showEditProfileModal() {
    if (!currentUser) {
        showStatus('Debes iniciar sesión para editar tu perfil', 'warning');
        showLoginModal();
        return;
    }

    // Si aún no tenemos los datos, cargarlos primero
    if (!currentUserData) {
        showLoading('Cargando perfil...');
        loadUserProfile();
        // Esperar un momento y luego abrir el modal
        setTimeout(() => {
            hideLoading();
            openProfileModal();
        }, 500);
    } else {
        openProfileModal();
    }
}

function openProfileModal() {
    // Poblar los selectores de país, provincia, ciudad
    populateSelect('profCountry', countriesList, 'code', 'name', currentUserData.country || 'EC');
    populateSelect('profState', provincesEcuador, null, null, currentUserData.state || '');
    // Poblar ciudades según provincia
    const state = currentUserData.state || '';
    const citySelect = document.getElementById('profCity');
    citySelect.innerHTML = '<option value="">Seleccionar...</option>';
    if (state && citiesByProvince[state]) {
        citiesByProvince[state].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            if (city === currentUserData.city) option.selected = true;
            citySelect.appendChild(option);
        });
    }

    // Rellenar el formulario con los datos actuales
    document.getElementById('profFullName').value = currentUserData.fullName || currentUserData.name || '';
    document.getElementById('profFirstName').value = currentUserData.firstName || '';
    document.getElementById('profLastName').value = currentUserData.lastName || '';
    document.getElementById('profEmail').value = currentUserData.email || currentUser.email || '';
    document.getElementById('profPhone').value = currentUserData.phone || '';
    document.getElementById('profIdentificationType').value = currentUserData.identificationType || 'cedula';
    document.getElementById('profIdentification').value = currentUserData.identification || '';
    document.getElementById('profCustomerType').value = currentUserData.customerType || 'particular';
    document.getElementById('profCompany').value = currentUserData.company || '';
    document.getElementById('profGender').value = currentUserData.gender || '';
    document.getElementById('profBirthdate').value = currentUserData.birthdate || '';
    document.getElementById('profShippingAddress').value = currentUserData.shippingAddress || '';
    document.getElementById('profBillingAddress').value = currentUserData.billingAddress || '';
    document.getElementById('profNotes').value = currentUserData.notes || '';
    document.getElementById('profNewsletter').checked = currentUserData.newsletter || false;

    // Abrir el modal
    const modal = new bootstrap.Modal(document.getElementById('profileModal'));
    modal.show();
}

function populateSelect(selectId, data, valueKey, labelKey, selectedValue) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar...</option>';
    if (!data || data.length === 0) {
        if (selectId === 'profCity') {
            select.innerHTML = '<option value="">Seleccionar provincia primero</option>';
        }
        return;
    }
    data.forEach(item => {
        const value = valueKey ? item[valueKey] : item;
        const label = labelKey ? item[labelKey] : item;
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        if (selectedValue && value === selectedValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function updateProfileCities() {
    const stateSelect = document.getElementById('profState');
    const citySelect = document.getElementById('profCity');
    const selectedState = stateSelect.value;
    citySelect.innerHTML = '<option value="">Seleccionar...</option>';
    if (selectedState && citiesByProvince[selectedState]) {
        citiesByProvince[selectedState].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

// Guardar el perfil del usuario
function saveProfile() {
    if (!currentUser) {
        showStatus('Debes iniciar sesión', 'warning');
        return;
    }

    const fullName = document.getElementById('profFullName').value.trim();
    const firstName = document.getElementById('profFirstName').value.trim();
    const lastName = document.getElementById('profLastName').value.trim();
    const phone = document.getElementById('profPhone').value.trim();
    const identificationType = document.getElementById('profIdentificationType').value;
    const identification = document.getElementById('profIdentification').value.trim();
    const customerType = document.getElementById('profCustomerType').value;
    const company = document.getElementById('profCompany').value.trim();
    const gender = document.getElementById('profGender').value;
    const birthdate = document.getElementById('profBirthdate').value;
    const country = document.getElementById('profCountry').value;
    const state = document.getElementById('profState').value;
    const city = document.getElementById('profCity').value;
    const shippingAddress = document.getElementById('profShippingAddress').value.trim();
    const billingAddress = document.getElementById('profBillingAddress').value.trim();
    const notes = document.getElementById('profNotes').value.trim();
    const newsletter = document.getElementById('profNewsletter').checked;

    // Validaciones
    if (!fullName && (!firstName || !lastName)) {
        showStatus('Nombre completo o nombres y apellidos son requeridos', 'warning');
        return;
    }
    // El email no se puede editar

    const updatedData = {
        fullName: fullName || firstName + ' ' + lastName,
        firstName: firstName,
        lastName: lastName,
        name: fullName || firstName + ' ' + lastName,
        email: currentUser.email, // no se permite cambiar
        phone: phone,
        identificationType: identificationType,
        identification: identification,
        customerType: customerType,
        company: company,
        gender: gender,
        birthdate: birthdate,
        country: country,
        state: state,
        city: city,
        shippingAddress: shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        notes: notes,
        newsletter: newsletter,
        updatedAt: Date.now()
    };

    // Actualizar en Firebase
    showLoading('Guardando perfil...');
    firebaseDatabase.ref('users/' + currentUser.uid).update(updatedData)
        .then(() => {
            hideLoading();
            // Actualizar datos locales
            currentUserData = { ...currentUserData, ...updatedData };
            // Actualizar nombre en el header si es necesario
            if (updatedData.fullName) {
                // Opcional: actualizar displayName en auth? No es necesario.
            }
            // Actualizar UI del usuario (nombre en el dropdown)
            updateUserUI();
            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();
            showStatus('✅ Perfil actualizado correctamente', 'success');
        })
        .catch(error => {
            hideLoading();
            console.error('Error guardando perfil:', error);
            showStatus('Error al guardar el perfil: ' + error.message, 'danger');
        });
}

// ============================================================
// MIS PEDIDOS (sin cambios)
// ============================================================
function viewMyOrders() {
    if (!currentUser) {
        showStatus('Debes iniciar sesión', 'warning');
        showLoginModal();
        return;
    }
    showLoading('Cargando tus pedidos...');
    firebaseDatabase.ref('orders').orderByChild('userId').equalTo(currentUser.uid).once('value')
        .then(snapshot => {
            hideLoading();
            const data = snapshot.val();
            if (!data) { alert('No tienes pedidos realizados.'); return; }
            let html = `<div class="table-responsive"><table class="table table-striped table-hover"><thead><tr><th>Pedido</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>`;
            Object.keys(data).forEach(key => {
                const order = data[key];
                const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Sin fecha';
                const statusClass = order.status === 'completado' ? 'bg-success' : order.status === 'enviado' ? 'bg-primary' : order.status === 'cancelado' ? 'bg-danger' : 'bg-warning';
                html += `<tr><td><strong>${order.orderNumber || 'N/A'}</strong></td><td>${date}</td><td>$${(order.total || 0).toFixed(2)}</td><td><span class="badge ${statusClass}">${order.status || 'pendiente'}</span></td><td><button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetailsCustomer('${key}')"><i class="fas fa-eye"></i> Detalles</button></td></tr>`;
            });
            html += `</tbody></table></div>`;
            const modalHtml = `<div class="modal fade" id="customerOrdersModal" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h5 class="modal-title"><i class="fas fa-box me-2"></i>Mis Pedidos</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body">${html}</div></div></div></div>`;
            const container = document.createElement('div');
            container.innerHTML = modalHtml;
            document.body.appendChild(container);
            const modal = new bootstrap.Modal(document.getElementById('customerOrdersModal'));
            modal.show();
            document.getElementById('customerOrdersModal').addEventListener('hidden.bs.modal', () => container.remove());
        })
        .catch(error => {
            hideLoading();
            showStatus('Error al cargar pedidos: ' + error.message, 'danger');
        });
}

function viewOrderDetailsCustomer(orderId) {
    firebaseDatabase.ref('orders/' + orderId).once('value')
        .then(snapshot => {
            const order = snapshot.val();
            if (!order) return;
            const itemsHtml = order.items ? order.items.map(item => `
                <tr><td>${item.name || 'Producto'}</td><td class="text-center">${item.quantity}</td><td class="text-end">$${(item.price || 0).toFixed(2)}</td><td class="text-end">$${( (item.price || 0) * (item.quantity || 1) ).toFixed(2)}</td></tr>
            `).join('') : '<tr><td colspan="4" class="text-center">Sin productos</td></tr>';
            const modalHtml = `<div class="modal fade" id="orderDetailsCustomerModal" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Detalles del Pedido #${order.orderNumber}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body"><div class="row"><div class="col-md-6"><h6>Información del Pedido</h6><p><strong>Número:</strong> ${order.orderNumber || 'N/A'}</p><p><strong>Fecha:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Sin fecha'}</p><p><strong>Estado:</strong> <span class="badge bg-warning">${order.status || 'pendiente'}</span></p><h6 class="mt-4">Información de Pago</h6><p><strong>Total:</strong> $${(order.total || 0).toFixed(2)}</p>${order.receiptUrl ? `<a href="${order.receiptUrl}" target="_blank" class="btn btn-sm btn-outline-primary">Ver Comprobante</a>` : '<p>No hay comprobante</p>'}</div><div class="col-md-6"><h6>Productos</h6><div class="table-responsive"><table class="table table-sm"><thead><tr><th>Producto</th><th class="text-center">Cant.</th><th class="text-end">Precio</th><th class="text-end">Total</th></tr></thead><tbody>${itemsHtml}</tbody><tfoot><tr><td colspan="3" class="text-end"><strong>Subtotal:</strong></td><td class="text-end">$${(order.subtotal || 0).toFixed(2)}</td></tr><tr><td colspan="3" class="text-end"><strong>Envío:</strong></td><td class="text-end">$${(order.shipping || 0).toFixed(2)}</td></tr><tr><td colspan="3" class="text-end"><strong>Total:</strong></td><td class="text-end"><strong>$${(order.total || 0).toFixed(2)}</strong></td></tr></tfoot></table></div></div></div></div></div></div></div>`;
            const container = document.createElement('div');
            container.innerHTML = modalHtml;
            document.body.appendChild(container);
            const modal = new bootstrap.Modal(document.getElementById('orderDetailsCustomerModal'));
            modal.show();
            document.getElementById('orderDetailsCustomerModal').addEventListener('hidden.bs.modal', () => container.remove());
        })
        .catch(error => showStatus('Error al cargar detalles: ' + error.message, 'danger'));
}

// ============================================================
// UTILIDADES
// ============================================================
function showAuthError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) { el.textContent = message; el.style.display = 'block'; }
}

function showGeneralAuthError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) { el.textContent = message; el.style.display = 'block'; }
}

function clearAuthErrors() {
    document.querySelectorAll('.auth-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    document.getElementById('loginGeneralError').style.display = 'none';
    document.getElementById('registerGeneralError').style.display = 'none';
    document.getElementById('resetGeneralError').style.display = 'none';
}

function showLoading(message) {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    if (overlay && text) {
        overlay.classList.add('show');
        text.textContent = message || 'Procesando...';
    }
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function showStatus(message, type) {
    const alert = document.getElementById('statusAlert');
    const msgSpan = document.getElementById('statusMessage');
    if (alert && msgSpan) {
        alert.className = 'alert alert-' + (type || 'success') + ' alert-dismissible fade show status-alert';
        msgSpan.textContent = message;
        alert.style.display = 'block';
        setTimeout(() => { if (alert.style.display === 'block') hideStatus(); }, 5000);
    }
}

function hideStatus() {
    const alert = document.getElementById('statusAlert');
    if (alert) alert.style.display = 'none';
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando tienda online...');
    loadStoreSettings().then(() => {
        setupEventListeners();
        if (firebaseAuth) {
            firebaseAuth.onAuthStateChanged(function(user) {
                currentUser = user;
                updateUserUI();
                if (user) {
                    loadUserCart();
                    loadUserProfile();
                } else {
                    try {
                        const saved = localStorage.getItem('cart');
                        if (saved) cart = JSON.parse(saved);
                        updateCartUI();
                    } catch (e) { cart = []; }
                    currentUserData = null;
                }
                loadProducts();
            });
        } else {
            loadProducts();
        }
    }).catch(error => {
        console.error('Error inicializando:', error);
        loadProducts();
    });
});

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        loginUser(email, password);
    });
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirmPassword').value;
        clearAuthErrors();
        let hasError = false;
        if (!name || name.trim().length < 2) {
            showAuthError('registerNameError', 'El nombre debe tener al menos 2 caracteres');
            hasError = true;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAuthError('registerEmailError', 'Ingresa un correo válido');
            hasError = true;
        }
        if (password.length < 6) {
            showAuthError('registerPasswordError', 'La contraseña debe tener al menos 6 caracteres');
            hasError = true;
        }
        if (password !== confirm) {
            showAuthError('registerConfirmPasswordError', 'Las contraseñas no coinciden');
            hasError = true;
        }
        if (hasError) return;
        registerUser(name, email, password);
    });
    document.getElementById('resetPasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAuthError('resetEmailError', 'Ingresa un correo válido');
            return;
        }
        resetPassword(email);
    });
    // Escuchar cambios de categoría para los módulos
    document.addEventListener('categoryChanged', function(e) {
        console.log('📂 Categoría cargada:', e.detail.category);
        const event = new CustomEvent('categoryLoaded_' + e.detail.category, { detail: e.detail });
        document.dispatchEvent(event);
    });
}