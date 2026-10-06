// ============================================================
// MEL MOTO PEÇAS
// Estoque separado por usuário + imagens + modais + vendas.
// ============================================================

const USERS_KEY = "melMotoUsers";
const LOGGED_USER_KEY = "melMotoLoggedUser";

const loggedUsername = localStorage.getItem(LOGGED_USER_KEY);

if (!loggedUsername) {
    window.location.href = "./login.html";
    throw new Error("Usuário não autenticado.");
}

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

const loggedUser = getUsers().find(user => user.username === loggedUsername);

if (!loggedUser) {
    localStorage.removeItem(LOGGED_USER_KEY);
    window.location.href = "./login.html";
    throw new Error("Usuário não encontrado.");
}

// ------------------------------------------------------------
// Dados individuais de cada usuário
// ------------------------------------------------------------

const productsKey = `melMotoProducts_${loggedUsername}`;
const salesKey = `melMotoSales_${loggedUsername}`;

function loadProducts() {
    const saved = localStorage.getItem(productsKey);

    if (saved) {
        return JSON.parse(saved);
    }

    // Cada usuário começa com seu próprio estoque.
    const initial = loggedUsername === "joao"
        ? [
            {
                id: Date.now() + 1,
                name: "Alavanca de embreagem",
                brand: "Honda",
                model: "CG 125",
                price: 52.98,
                quantity: 6,
                image: ""
            },
            {
                id: Date.now() + 2,
                name: "Aro roda traseira",
                brand: "Honda",
                model: "Biz 100",
                price: 100,
                quantity: 3,
                image: ""
            }
        ]
        : [
            {
                id: Date.now() + 3,
                name: "Painel completo",
                brand: "Titan",
                model: "150 ES 2004 à 2009",
                price: 78.99,
                quantity: 17,
                image: ""
            }
        ];

    localStorage.setItem(productsKey, JSON.stringify(initial));
    return initial;
}

function loadSales() {
    return JSON.parse(localStorage.getItem(salesKey) || "[]");
}

let products = loadProducts();
let sales = loadSales();
let selectedProductId = null;

function saveProducts() {
    localStorage.setItem(productsKey, JSON.stringify(products));
}

function saveSales() {
    localStorage.setItem(salesKey, JSON.stringify(sales));
}

// ------------------------------------------------------------
// Elementos
// ------------------------------------------------------------

const productForm = document.querySelector("#productForm");
const productImage = document.querySelector("#productImage");
const imagePreview = document.querySelector("#imagePreview");
const imagePreviewBox = document.querySelector("#imagePreviewBox");

const configOverlay = document.querySelector("#configOverlay");
const configContent = document.querySelector("#configContent");

const saleOverlay = document.querySelector("#saleOverlay");
const saleQuantity = document.querySelector("#saleQuantity");
const saleTotal = document.querySelector("#saleTotal");

const searchInput = document.querySelector("#searchInput");
const stockFilter = document.querySelector("#stockFilter");

// ------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------

function formatPrice(value) {
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function todayString() {
    const date = new Date();

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getStatus(quantity) {
    if (quantity === 0) {
        return '<span class="status status-out">Sem estoque</span>';
    }

    if (quantity <= 5) {
        return '<span class="status status-low">Estoque baixo</span>';
    }

    return '<span class="status status-ok">Disponível</span>';
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ------------------------------------------------------------
// Login / usuário
// ------------------------------------------------------------

document.querySelector("#currentUserName").textContent = loggedUser.name;
document.querySelector("#welcomeUser").textContent = loggedUser.name;

document.querySelector("#logoutButton").addEventListener("click", function() {
    localStorage.removeItem(LOGGED_USER_KEY);
    window.location.href = "./login.html";
});

// ------------------------------------------------------------
// Dashboard
// ------------------------------------------------------------

function getTodaySales() {
    return sales.filter(sale => sale.date === todayString());
}

function getTodayRevenue() {
    return getTodaySales().reduce((sum, sale) => sum + sale.total, 0);
}

function getTodayUnits() {
    return getTodaySales().reduce((sum, sale) => sum + sale.quantity, 0);
}

function updateDashboardNumbers() {
    const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
    const lowStock = products.filter(product => product.quantity <= 5).length;
    const revenue = getTodayRevenue();

    document.querySelector("#totalProducts").textContent = products.length;
    document.querySelector("#totalStock").textContent = totalStock;
    document.querySelector("#lowStock").textContent = lowStock;
    document.querySelector("#todayRevenue").textContent = formatPrice(revenue);

    document.querySelector("#financeTodayRevenue").textContent = formatPrice(revenue);
    document.querySelector("#financeTodayUnits").textContent = getTodayUnits();
}

function renderDashboard() {
    const table = document.querySelector("#dashboardTable");
    table.innerHTML = "";

    products.slice(0, 5).forEach(product => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>${escapeHtml(product.name)}</strong></td>
            <td>${escapeHtml(product.brand)}</td>
            <td>${escapeHtml(product.model)}</td>
            <td>${formatPrice(product.price)}</td>
            <td>${product.quantity}</td>
        `;

        table.appendChild(row);
    });
}

// ------------------------------------------------------------
// Estoque em cards
// ------------------------------------------------------------

function renderProducts() {
    const grid = document.querySelector("#productGrid");
    const search = searchInput.value.toLowerCase().trim();
    const filter = stockFilter.value;

    const filtered = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(search) ||
            product.brand.toLowerCase().includes(search) ||
            product.model.toLowerCase().includes(search);

        let matchesFilter = true;

        if (filter === "low") {
            matchesFilter = product.quantity > 0 && product.quantity <= 5;
        }

        if (filter === "out") {
            matchesFilter = product.quantity === 0;
        }

        return matchesSearch && matchesFilter;
    });

    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <strong>Nenhum produto encontrado.</strong>
                <span>Tente mudar a pesquisa ou o filtro.</span>
            </div>
        `;
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const imageHtml = product.image
            ? `<img src="${product.image}" alt="${escapeHtml(product.name)}">`
            : `<div class="no-image">M</div>`;

        card.innerHTML = `
            <div class="product-image">${imageHtml}</div>

            <div class="product-card-info">
                <div class="product-title-row">
                    <div>
                        <h3>${escapeHtml(product.name)}</h3>
                        <p>${escapeHtml(product.brand)} • ${escapeHtml(product.model)}</p>
                    </div>

                    <button
                        class="settings-button"
                        onclick="openConfig(${product.id})"
                        title="Configurações do produto"
                    >⚙</button>
                </div>

                <div class="product-bottom">
                    <div>
                        <span class="product-price">${formatPrice(product.price)}</span>
                        <span class="product-quantity">${product.quantity} unidade(s)</span>
                    </div>

                    ${getStatus(product.quantity)}
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

// ------------------------------------------------------------
// Cadastro + imagem
// ------------------------------------------------------------

productImage.addEventListener("change", function() {
    const file = productImage.files[0];

    if (!file) {
        imagePreviewBox.classList.add("hidden");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        imagePreview.src = event.target.result;
        imagePreviewBox.classList.remove("hidden");
    };

    reader.readAsDataURL(file);
});

productForm.addEventListener("reset", function() {
    setTimeout(() => {
        imagePreviewBox.classList.add("hidden");
        imagePreview.removeAttribute("src");
    }, 0);
});

productForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const file = productImage.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            createProduct(event.target.result);
        };

        reader.readAsDataURL(file);
    } else {
        createProduct("");
    }
});

function createProduct(imageData) {
    const product = {
        id: Date.now(),
        name: document.querySelector("#productName").value.trim(),
        brand: document.querySelector("#productBrand").value.trim(),
        model: document.querySelector("#productModel").value.trim(),
        price: Number(document.querySelector("#productPrice").value),
        quantity: Number(document.querySelector("#productQuantity").value),
        image: imageData
    };

    products.push(product);
    saveProducts();

    productForm.reset();
    imagePreviewBox.classList.add("hidden");
    imagePreview.removeAttribute("src");

    updateEverything();

    alert("Produto cadastrado com sucesso!");

    document.querySelector("#estoque").scrollIntoView({
        behavior: "smooth"
    });
}

// ------------------------------------------------------------
// Modal de configuração
// ------------------------------------------------------------

function openConfig(id) {
    const product = products.find(item => item.id === id);

    if (!product) return;

    selectedProductId = id;

    const imageHtml = product.image
        ? `<img class="modal-product-image" src="${product.image}" alt="${escapeHtml(product.name)}">`
        : `<div class="modal-no-image">M</div>`;

    configContent.innerHTML = `
        <span class="eyebrow">CONFIGURAÇÃO</span>

        <div class="modal-product-header">
            ${imageHtml}

            <div>
                <h2>${escapeHtml(product.name)}</h2>
                <p>${escapeHtml(product.brand)} • ${escapeHtml(product.model)}</p>
                <strong>${formatPrice(product.price)}</strong>
                <span class="modal-stock">Estoque atual: ${product.quantity}</span>
            </div>
        </div>

        <div class="config-actions">
            <button class="config-action" onclick="changeQuantity(${product.id}, 1)">
                <span>＋</span>
                <strong>Adicionar</strong>
                <small>+1 unidade</small>
            </button>

            <button class="config-action" onclick="changeQuantity(${product.id}, -1)">
                <span>−</span>
                <strong>Retirar</strong>
                <small>-1 unidade</small>
            </button>

            <button class="config-action" onclick="openEditProduct(${product.id})">
                <span>✎</span>
                <strong>Editar informações</strong>
                <small>Nome, marca, preço...</small>
            </button>

            <button class="config-action sale-action" onclick="openSale(${product.id})">
                <span>R$</span>
                <strong>Vendido</strong>
                <small>Registrar uma venda</small>
            </button>
        </div>

        <button class="delete-link" onclick="deleteProduct(${product.id})">
            Excluir produto
        </button>
    `;

    configOverlay.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function closeConfig() {
    configOverlay.classList.add("hidden");

    if (saleOverlay.classList.contains("hidden")) {
        document.body.classList.remove("modal-open");
    }
}

document.querySelector("#closeConfig").addEventListener("click", closeConfig);

configOverlay.addEventListener("click", function(event) {
    if (event.target === configOverlay) {
        closeConfig();
    }
});

// ------------------------------------------------------------
// Adicionar / retirar
// ------------------------------------------------------------

function changeQuantity(id, amount) {
    const product = products.find(item => item.id === id);

    if (!product) return;

    if (amount < 0 && product.quantity <= 0) {
        alert("O estoque deste produto já está zerado.");
        return;
    }

    product.quantity += amount;

    saveProducts();
    updateEverything();

    openConfig(id);
}

// ------------------------------------------------------------
// Editar produto
// ------------------------------------------------------------

function openEditProduct(id) {
    const product = products.find(item => item.id === id);

    if (!product) return;

    const imageHtml = product.image
        ? `<img class="edit-image" id="editImagePreview" src="${product.image}" alt="Imagem atual">`
        : `<div class="edit-image-placeholder" id="editImagePreview">M</div>`;

    configContent.innerHTML = `
        <span class="eyebrow">EDITAR PRODUTO</span>
        <h2>Editar informações</h2>

        <div class="edit-image-area">
            ${imageHtml}
            <label class="button button-secondary image-button">
                Trocar imagem
                <input type="file" id="editProductImage" accept="image/*" hidden>
            </label>
        </div>

        <div class="form-grid modal-form-grid">
            <div class="input-group">
                <label for="editName">Nome</label>
                <input id="editName" value="${escapeHtml(product.name)}">
            </div>

            <div class="input-group">
                <label for="editBrand">Marca</label>
                <input id="editBrand" value="${escapeHtml(product.brand)}">
            </div>

            <div class="input-group">
                <label for="editModel">Modelo</label>
                <input id="editModel" value="${escapeHtml(product.model)}">
            </div>

            <div class="input-group">
                <label for="editPrice">Preço</label>
                <input id="editPrice" type="number" min="0" step="0.01" value="${product.price}">
            </div>
        </div>

        <div class="modal-actions">
            <button class="button button-primary" onclick="saveEditedProduct(${id})">
                Salvar alterações
            </button>

            <button class="button button-secondary" onclick="openConfig(${id})">
                Cancelar
            </button>
        </div>
    `;

    document.querySelector("#editProductImage").addEventListener("change", function(event) {
        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function(e) {
            const preview = document.querySelector("#editImagePreview");

            if (preview.tagName === "IMG") {
                preview.src = e.target.result;
            } else {
                preview.outerHTML = `<img class="edit-image" id="editImagePreview" src="${e.target.result}" alt="Nova imagem">`;
            }
        };

        reader.readAsDataURL(file);
    });
}

function saveEditedProduct(id) {
    const product = products.find(item => item.id === id);

    if (!product) return;

    product.name = document.querySelector("#editName").value.trim();
    product.brand = document.querySelector("#editBrand").value.trim();
    product.model = document.querySelector("#editModel").value.trim();
    product.price = Number(document.querySelector("#editPrice").value);

    const fileInput = document.querySelector("#editProductImage");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            product.image = event.target.result;
            saveProducts();
            updateEverything();
            openConfig(id);
        };

        reader.readAsDataURL(file);
    } else {
        saveProducts();
        updateEverything();
        openConfig(id);
    }
}

// ------------------------------------------------------------
// Excluir
// ------------------------------------------------------------

function deleteProduct(id) {
    const product = products.find(item => item.id === id);

    if (!product) return;

    if (!confirm(`Deseja realmente excluir "${product.name}"?`)) {
        return;
    }

    products = products.filter(item => item.id !== id);

    saveProducts();
    updateEverything();
    closeConfig();
}

// ------------------------------------------------------------
// Modal de venda
// ------------------------------------------------------------

function openSale(id) {
    const product = products.find(item => item.id === id);

    if (!product) return;

    if (product.quantity <= 0) {
        alert("Não é possível vender este produto porque o estoque está zerado.");
        return;
    }

    selectedProductId = id;

    document.querySelector("#saleProductName").textContent =
        `${product.name} • Estoque disponível: ${product.quantity}`;

    document.querySelector("#saleUnitPrice").textContent =
        formatPrice(product.price);

    saleQuantity.value = 1;
    updateSaleTotal();

    saleOverlay.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function closeSale() {
    saleOverlay.classList.add("hidden");

    if (configOverlay.classList.contains("hidden")) {
        document.body.classList.remove("modal-open");
    }
}

document.querySelector("#closeSale").addEventListener("click", closeSale);
document.querySelector("#cancelSale").addEventListener("click", closeSale);

saleQuantity.addEventListener("input", updateSaleTotal);

function updateSaleTotal() {
    const product = products.find(item => item.id === selectedProductId);

    if (!product) return;

    const quantity = Math.max(0, Number(saleQuantity.value) || 0);

    saleTotal.textContent = formatPrice(product.price * quantity);
}

document.querySelector("#confirmSale").addEventListener("click", function() {
    const product = products.find(item => item.id === selectedProductId);

    if (!product) return;

    const quantity = Number(saleQuantity.value);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Informe uma quantidade válida.");
        return;
    }

    if (quantity > product.quantity) {
        alert(`Você só possui ${product.quantity} unidade(s) deste produto.`);
        return;
    }

    const sale = {
        id: Date.now(),
        date: todayString(),
        createdAt: new Date().toISOString(),
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.price,
        total: quantity * product.price
    };

    product.quantity -= quantity;
    sales.push(sale);

    saveProducts();
    saveSales();

    closeSale();
    closeConfig();

    updateEverything();

    alert(
        `Venda registrada!\n\n` +
        `${quantity} × ${product.name}\n` +
        `Total: ${formatPrice(sale.total)}`
    );

    document.querySelector("#financeiro").scrollIntoView({
        behavior: "smooth"
    });
});

// ------------------------------------------------------------
// Financeiro
// ------------------------------------------------------------

function renderSales() {
    const table = document.querySelector("#salesTable");
    const todaySales = getTodaySales();

    table.innerHTML = "";

    if (todaySales.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">
                    Nenhuma venda registrada hoje.
                </td>
            </tr>
        `;
        return;
    }

    [...todaySales].reverse().forEach(sale => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${formatTime(sale.createdAt)}</td>
            <td><strong>${escapeHtml(sale.productName)}</strong></td>
            <td>${sale.quantity}</td>
            <td>${formatPrice(sale.unitPrice)}</td>
            <td><strong>${formatPrice(sale.total)}</strong></td>
        `;

        table.appendChild(row);
    });
}

// ------------------------------------------------------------
// Teclado
// ------------------------------------------------------------

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeSale();
        closeConfig();
    }
});

// ------------------------------------------------------------
// Pesquisa
// ------------------------------------------------------------

searchInput.addEventListener("input", renderProducts);
stockFilter.addEventListener("change", renderProducts);

// ------------------------------------------------------------
// Atualização geral
// ------------------------------------------------------------

function updateEverything() {
    updateDashboardNumbers();
    renderDashboard();
    renderProducts();
    renderSales();
}

updateEverything();
