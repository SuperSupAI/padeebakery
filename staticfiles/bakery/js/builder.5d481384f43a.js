// Data is now loaded via: const BREAD_DATA = JSON.parse('{{ bread_data_json|safe }}'); in the HTML

// --- Global State ---
let selectedBase = null;
let selectedMixins = [];
let selectedToppings = null;
let currentCart = [];

// --- Constants ---
const MIXIN_MAX = 3;
const BASE_PRICE = 120; // Base price for any base dough

// --- DOM Elements ---
const baseOptionsEl = document.getElementById('base-options');
const mixinOptionsEl = document.getElementById('mixin-options');
const toppingOptionsEl = document.getElementById('topping-options');
const previewImageEl = document.getElementById('preview-image');
const previewMixinsEl = document.getElementById('preview-mixins');
const previewToppingsEl = document.getElementById('preview-toppings');

// Summary elements
const summaryBaseEl = document.getElementById('summary-base');
const summaryMixinsEl = document.getElementById('summary-mixins');
const summaryToppingsEl = document.getElementById('summary-toppings');
const totalPriceEl = document.getElementById('total-price');

// Cart elements
const cartItemsContainerEl = document.getElementById('cart-items-container');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartTotalEl = document.getElementById('cart-total');
const cartBadgeEl = document.getElementById('cart-badge');
const cartCountLabelEl = document.getElementById('cart-count-label');
const emptyCartMessageEl = document.getElementById('empty-cart-message');
const homeViewEl = document.getElementById('home-view');
const cartViewEl = document.getElementById('cart-view');

// --- Helper Functions ---

/** Creates the HTML card for a selection option. */
const createOptionCard = (item, type, isSelected) => {
    const isMulti = type === 'mixins';
    const cardEl = document.createElement('div');
    cardEl.className = `selection-card p-4 rounded-xl border-2 border-gray-200 cursor-pointer transition-all duration-200 text-center hover:border-amber-400 transform shadow-sm ${isSelected ? 'active' : ''} ${type === 'mixins' ? 'col-span-1' : 'col-span-1'}`;
    cardEl.setAttribute('data-id', item.id);
    cardEl.setAttribute('onclick', `${type === 'base' ? 'selectBase' : type === 'mixins' ? 'toggleMixin' : 'selectTopping'}('${item.id}')`);

    let iconHtml = '';
    if (isMulti) {
        iconHtml = `<div class="absolute top-2 right-2 text-white bg-amber-600 w-5 h-5 rounded-full flex items-center justify-center icon-pop ${isSelected ? 'block' : 'hidden'}">
                        <i class="fa-solid fa-check text-xs"></i>
                    </div>`;
    }

    cardEl.innerHTML = `
        <div class="relative flex flex-col items-center">
            ${iconHtml}
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600 text-xl overflow-hidden">
                <img src="${item.icon}" alt="${item.name}" class="w-full h-full object-cover">
            </div>
            <p class="font-medium text-gray-900 leading-snug">${item.name}</p>
            <p class="text-xs text-amber-600 font-bold mt-1">+฿${item.price}</p>
        </div>
    `;

    // Add extra class if mixin is disabled (max reached)
    if (type === 'mixins' && !isSelected && selectedMixins.length >= MIXIN_MAX) {
        cardEl.classList.add('opacity-50', 'pointer-events-none');
    }

    return cardEl;
};

/** Renders all selection cards for a given type. */
const renderOptions = (data, containerEl, type) => {
    containerEl.innerHTML = '';
    const items = data[type];

    items.forEach(item => {
        let isSelected = false;
        if (type === 'base' && selectedBase && selectedBase.id === item.id) {
            isSelected = true;
        } else if (type === 'mixins' && selectedMixins.some(m => m.id === item.id)) {
            isSelected = true;
        } else if (type === 'toppings' && selectedToppings && selectedToppings.id === item.id) {
            isSelected = true;
        }
        containerEl.appendChild(createOptionCard(item, type, isSelected));
    });
};

/** Updates the live visual preview and summary. */
const updatePreview = () => {
    const currentBase = selectedBase;
    const currentMixins = selectedMixins;
    const currentTopping = selectedToppings;

    // 1. Update Base Image
    if (currentBase) {
        previewImageEl.src = currentBase.image;
        previewImageEl.style.display = 'block';
    } else {
        previewImageEl.src = '';
        previewImageEl.style.display = 'none';
    }

    // 2. Update Mixins Preview (Icons inside the bread)
    previewMixinsEl.innerHTML = '';
    if (currentMixins.length > 0) {
        const iconSize = 24; // Base icon size
        let startAngle = 0;
        const totalItems = currentMixins.length;
        const angleStep = 360 / totalItems;
        const radius = 60; // Distance from center

        currentMixins.forEach((mixin, index) => {
            const angle = (startAngle + index * angleStep) * (Math.PI / 180);
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            const mixinEl = document.createElement('div');
            mixinEl.className = 'absolute icon-pop';
            mixinEl.style.left = `calc(50% + ${x}px - ${iconSize / 2}px)`;
            mixinEl.style.top = `calc(50% + ${y}px - ${iconSize / 2}px)`;
            mixinEl.innerHTML = `<img src="${mixin.icon}" alt="${mixin.name}" class="w-6 h-6 rounded-full shadow-md border-2 border-white">`;
            previewMixinsEl.appendChild(mixinEl);
        });
    }

    // 3. Update Toppings Preview (Icons on top of the bread)
    previewToppingsEl.innerHTML = '';
    if (currentTopping) {
        const toppingEl = document.createElement('div');
        toppingEl.className = 'absolute top-4 right-4 z-40 float-slow icon-pop';
        toppingEl.innerHTML = `<img src="${currentTopping.icon}" alt="${currentTopping.name}" class="w-10 h-10 rounded-full shadow-lg border-4 border-white">`;
        previewToppingsEl.appendChild(toppingEl);
    }
};

/** Calculates the total price of the current bread configuration. */
const calculatePrice = () => {
    let price = 0;
    let baseName = '-';
    let mixinNames = 'ไม่มี';
    let toppingName = 'ไม่มี';
    let mixinTotal = 0;

    if (selectedBase) {
        price += selectedBase.price;
        baseName = selectedBase.name;
    }

    if (selectedMixins.length > 0) {
        selectedMixins.forEach(mixin => {
            price += mixin.price;
            mixinTotal += mixin.price;
        });
        mixinNames = selectedMixins.map(m => m.name).join(', ');
    }

    if (selectedToppings) {
        price += selectedToppings.price;
        toppingName = selectedToppings.name;
    }

    // Update Summary
    summaryBaseEl.textContent = `${baseName} (฿${selectedBase ? selectedBase.price : 0})`;
    summaryMixinsEl.innerHTML = selectedMixins.length > 0 
        ? selectedMixins.map(m => `<div>${m.name} (+฿${m.price})</div>`).join('') + `<div class="text-xs mt-1 text-gray-500">รวม ฿${mixinTotal}</div>`
        : 'ไม่มี';
    summaryToppingsEl.textContent = `${toppingName} (+฿${selectedToppings ? selectedToppings.price : 0})`;
    totalPriceEl.textContent = `฿${price}`;

    // Disable Add to Cart button if base is not selected
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (!selectedBase) {
        addToCartBtn.disabled = true;
        addToCartBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        addToCartBtn.disabled = false;
        addToCartBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    return price;
};

// --- Selection Logic ---

window.selectBase = (id) => {
    const newBase = BREAD_DATA.base.find(item => item.id === id);
    selectedBase = newBase;
    renderOptions(BREAD_DATA, baseOptionsEl, 'base');
    updatePreview();
    calculatePrice();
};

window.toggleMixin = (id) => {
    const existingIndex = selectedMixins.findIndex(item => item.id === id);
    if (existingIndex > -1) {
        // Remove mixin
        selectedMixins.splice(existingIndex, 1);
    } else {
        // Add mixin, check max limit
        if (selectedMixins.length < MIXIN_MAX) {
            const newMixin = BREAD_DATA.mixins.find(item => item.id === id);
            selectedMixins.push(newMixin);
        } else {
            alert(`เลือกไส้ผสมได้สูงสุดเพียง ${MIXIN_MAX} อย่างเท่านั้น!`);
        }
    }
    renderOptions(BREAD_DATA, mixinOptionsEl, 'mixins');
    updatePreview();
    calculatePrice();
};

window.selectTopping = (id) => {
    const newTopping = BREAD_DATA.toppings.find(item => item.id === id);
    if (selectedToppings && selectedToppings.id === id) {
        selectedToppings = null; // Deselect
    } else {
        selectedToppings = newTopping; // Select new
    }
    renderOptions(BREAD_DATA, toppingOptionsEl, 'toppings');
    updatePreview();
    calculatePrice();
};

// --- Cart Logic ---

/** Adds the current bread configuration to the cart. */
window.addToCart = () => {
    if (!selectedBase) {
        alert('กรุณาเลือกเนื้อแป้งก่อนเพิ่มลงตะกร้า');
        return;
    }

    const currentPrice = calculatePrice();
    const breadName = `ขนมปัง ${selectedBase.name}`;
    const description = [
        ...selectedMixins.map(m => m.name),
        ...(selectedToppings ? [`ท็อปปิ้ง: ${selectedToppings.name}`] : [])
    ].join(' | ');

    const newItem = {
        id: Date.now(),
        name: breadName,
        description: description,
        base: selectedBase.id,
        mixins: selectedMixins.map(m => m.id),
        topping: selectedToppings ? selectedToppings.id : null,
        price: currentPrice,
        image: selectedBase.image,
        quantity: 1,
    };

    currentCart.push(newItem);
    updateCartDisplay();
    alert(`เพิ่ม "${breadName}" ราคา ฿${currentPrice} ลงในตะกร้าแล้ว!`);

    // Reset selection after adding to cart
    selectedBase = null;
    selectedMixins = [];
    selectedToppings = null;
    initializeBuilder();
};

/** Renders the cart items and updates totals. */
const renderCartItems = () => {
    cartItemsContainerEl.innerHTML = '';
    let subtotal = 0;

    if (currentCart.length === 0) {
        emptyCartMessageEl.classList.remove('hidden');
        return;
    } else {
        emptyCartMessageEl.classList.add('hidden');
    }

    currentCart.forEach(item => {
        subtotal += item.price * item.quantity;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'flex items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-fade-in';
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover mr-4">
            <div class="flex-grow">
                <p class="font-bold text-gray-900">${item.name}</p>
                <p class="text-sm text-gray-500 truncate">${item.description || 'สูตรต้นตำรับ'}</p>
                <p class="font-bold text-amber-600 mt-1">฿${item.price}</p>
            </div>
            <div class="flex items-center ml-4 gap-2">
                <button onclick="changeQuantity(${item.id}, -1)" class="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"><i class="fa-solid fa-minus text-xs"></i></button>
                <span class="font-semibold w-4 text-center">${item.quantity}</span>
                <button onclick="changeQuantity(${item.id}, 1)" class="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"><i class="fa-solid fa-plus text-xs"></i></button>
                <button onclick="removeItem(${item.id})" class="ml-4 text-red-500 hover:text-red-700 transition">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainerEl.appendChild(itemEl);
    });

    cartSubtotalEl.textContent = `฿${subtotal}`;
    cartTotalEl.textContent = `฿${subtotal}`; // Free shipping in this example
};

/** Changes the quantity of an item in the cart. */
window.changeQuantity = (id, delta) => {
    const item = currentCart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeItem(id);
        } else {
            updateCartDisplay();
        }
    }
};

/** Removes an item from the cart. */
window.removeItem = (id) => {
    currentCart = currentCart.filter(item => item.id !== id);
    updateCartDisplay();
};

/** Updates all cart related displays (badge, count, list). */
const updateCartDisplay = () => {
    const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);

    cartBadgeEl.textContent = totalItems;
    cartBadgeEl.classList.toggle('hidden', totalItems === 0);
    cartCountLabelEl.textContent = `ตะกร้า (${totalItems})`;

    renderCartItems();
};

// --- View Switching ---

window.switchView = (view) => {
    if (view === 'home') {
        homeViewEl.classList.remove('hidden');
        cartViewEl.classList.add('hidden');
        // Ensure cart is updated when returning home
        updateCartDisplay();
        // Scroll to top
        window.scrollTo(0, 0);
    } else if (view === 'cart') {
        homeViewEl.classList.add('hidden');
        cartViewEl.classList.remove('hidden');
        updateCartDisplay(); // Make sure the cart list is fresh
        // Scroll to top
        window.scrollTo(0, 0);
    }
};

// --- Initialization ---

const initializeBuilder = () => {
    renderOptions(BREAD_DATA, baseOptionsEl, 'base');
    renderOptions(BREAD_DATA, mixinOptionsEl, 'mixins');
    renderOptions(BREAD_DATA, toppingOptionsEl, 'toppings');
    updatePreview();
    calculatePrice();
    updateCartDisplay();
};

document.addEventListener('DOMContentLoaded', initializeBuilder);

// Optional: Hide/Show navbar based on scroll
let lastScrollY = 0;
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('shadow-md');
    } else {
        navbar.classList.remove('shadow-md');
    }
    lastScrollY = window.scrollY;
});