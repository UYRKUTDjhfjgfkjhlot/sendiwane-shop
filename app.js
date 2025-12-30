// Cart management and main application logic
window.PRODUCTS = { corporel: [], maison: [] }; // Initialize empty products container

class ShoppingCart {
    constructor() {
      this.items = this.loadCart();
      this.currentProduct = null;
      this.currentQuantity = 1;
      this.initialize();
    }
  
    initialize() {
      this.updateCartBadge();
      this.setupEventListeners();
      // Don't auto-load products on homepage - they will be loaded when category is selected
      if (typeof window.currentCategory !== 'undefined' && window.currentCategory) {
        this.loadProducts(window.currentCategory);
      }
    }
  
    loadCart() {
        try {
            return JSON.parse(localStorage.getItem('cart')) || [];
        } catch (e) {
            return [];
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartBadge();
    }

    setupEventListeners() {
      // Cart button click
      const cartBtn = document.getElementById('cart-btn');
      if (cartBtn) {
        cartBtn.addEventListener('click', () => this.showCartModal());
      }
  
      // Modal close buttons
      this.setupModalCloseListeners();
  
      // Product modal controls
      this.setupProductModalControls();
  
      // Cart modal controls
      this.setupCartModalControls();
  
      // Checkout form
      this.setupCheckoutForm();
    }
  
    setupModalCloseListeners() {
      // Close buttons
      document.querySelectorAll('[id$="-modal"] .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const modal = e.target.closest('.modal');
          this.hideModal(modal);
        });
      });
  
      // Backdrop clicks
      document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
          const modal = e.target.closest('.modal');
          this.hideModal(modal);
        });
      });
  
      // Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const visibleModal = document.querySelector('.modal:not(.hidden)');
          if (visibleModal) {
            this.hideModal(visibleModal);
          }
        }
      });
    }
  
    setupProductModalControls() {
      const decreaseBtn = document.getElementById('decrease-qty');
      const increaseBtn = document.getElementById('increase-qty');
      const addToCartBtn = document.getElementById('add-to-cart-modal');
      const goToCheckoutBtn = document.getElementById('go-to-checkout');
  
      if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
          if (this.currentQuantity > 1) {
            this.currentQuantity--;
            this.updateProductModal();
          }
        });
      }
  
      if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
          this.currentQuantity++;
          this.updateProductModal();
        });
      }
  
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
          this.addToCart(this.currentProduct, this.currentQuantity);
          this.showAddedAnimation(addToCartBtn);
          setTimeout(() => {
            this.hideModal(document.getElementById('product-modal'));
          }, 1000);
        });
      }
  
      if (goToCheckoutBtn) {
        goToCheckoutBtn.addEventListener('click', (e) => {
             this.hideModal(document.getElementById('product-modal'));
             e.preventDefault();
             this.showCheckoutModal();
        });
      }
    }

    setupCartModalControls() {
        const proceedBtn = document.getElementById('proceed-checkout');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                this.hideModal(document.getElementById('cart-modal'));
                this.showCheckoutModal();
            });
        }
        
        // Event delegation for remove buttons in cart
        const cartItemsContainer = document.getElementById('cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', (e) => {
                if (e.target.closest('.remove-item')) {
                    const index = parseInt(e.target.closest('.remove-item').dataset.index);
                    this.removeFromCart(index);
                }
            });
        }
    }

    setupCheckoutForm() {
        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processCheckout(new FormData(form));
            });
        }
    }

    addToCart(product, quantity) {
        if (!product) return;
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ ...product, quantity });
        }
        this.saveCart();
        this.updateCartDisplay();
    }

    removeFromCart(index) {
        this.items.splice(index, 1);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const container = document.getElementById('cart-items');
        const totalEl = document.getElementById('cart-total-price');
        const checkoutTotalEl = document.getElementById('checkout-total-price');
        
        if (!container) return;
        
        container.innerHTML = '';
        let total = 0;
        
        if (this.items.length === 0) {
            container.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
        } else {
            this.items.forEach((item, index) => {
                total += item.price * item.quantity;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>${item.price.toLocaleString()} FCFA x ${item.quantity}</p>
                    </div>
                    <button class="remove-item" data-index="${index}" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                container.appendChild(div);
            });
        }
        
        const formattedTotal = total.toLocaleString() + ' FCFA';
        if (totalEl) totalEl.textContent = formattedTotal;
        if (checkoutTotalEl) checkoutTotalEl.textContent = formattedTotal;
    }

    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    showCartModal() {
        this.updateCartDisplay();
        const modal = document.getElementById('cart-modal');
        modal.classList.remove('hidden');
    }

    showCheckoutModal() {
        this.updateCartDisplay(); // Ensure total is correct
        const modal = document.getElementById('checkout-modal');
        modal.classList.remove('hidden');
    }

    hideModal(modal) {
        if (modal) modal.classList.add('hidden');
    }

    showProductModal(product) {
        this.currentProduct = product;
        this.currentQuantity = 1;
        this.updateProductModal();
        const modal = document.getElementById('product-modal');
        modal.classList.remove('hidden');
    }

    updateProductModal() {
        if (!this.currentProduct) return;
        
        document.getElementById('modal-product-image').src = this.currentProduct.image;
        document.getElementById('modal-product-name').textContent = this.currentProduct.name;
        document.getElementById('modal-product-price').textContent = this.currentProduct.price.toLocaleString() + ' FCFA';
        document.getElementById('modal-quantity').textContent = this.currentQuantity;
        
        const total = this.currentProduct.price * this.currentQuantity;
        document.getElementById('modal-total').textContent = total.toLocaleString() + ' FCFA';
    }

    processCheckout(formData) {
        const name = formData.get('name');
        const phone = formData.get('phone');
        const address = formData.get('address');
        
        let message = `*Nouvelle Commande*\n\n`;
        message += `👤 *Client:* ${name}\n`;
        message += `📱 *Téléphone:* ${phone}\n`;
        message += `📍 *Adresse:* ${address}\n\n`;
        message += `*Commande:*\n`;
        
        let total = 0;
        this.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `- ${item.name} (x${item.quantity}) : ${itemTotal.toLocaleString()} FCFA\n`;
        });
        
        message += `\n💰 *Total:* ${total.toLocaleString()} FCFA`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = '221771234567'; // From footer
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
        
        this.clearCart();
        this.hideModal(document.getElementById('checkout-modal'));
        this.showSuccessMessage();
    }
    
    clearCart() {
      this.items = [];
      this.saveCart();
      this.updateCartBadge();
      this.updateCartDisplay();
    }

    showSuccessMessage() {
      alert('Votre commande a été envoyée avec succès! Vous allez être redirigé vers WhatsApp pour finaliser.');
    }

    showAddedAnimation(button) {
      const icon = button.querySelector('i');
      if (!icon) return;

      // Reset state if animation is already running
      if (button.dataset.animTimeout) {
        clearTimeout(parseInt(button.dataset.animTimeout));
        const originalClass = button.dataset.originalIconClass;
        if (originalClass) icon.className = originalClass;
        button.classList.remove('added', 'btn-success');
        button.style.backgroundColor = '';
        button.style.color = '';
        button.style.transform = '';
        button.style.transition = '';
      }

      // Store original class
      if (!button.dataset.originalIconClass) {
        button.dataset.originalIconClass = icon.className;
      }
      const originalClass = button.dataset.originalIconClass;

      // Force reflow
      void button.offsetWidth;

      // Start animation
      icon.className = 'fas fa-check';
      button.classList.add('added', 'btn-success');
      button.style.backgroundColor = '#28a745';
      button.style.color = 'white';
      button.style.transform = 'scale(1.05)';
      button.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        button.style.transform = 'scale(1.1)';
      }, 150);
      
      setTimeout(() => {
        button.style.transform = 'scale(1.05)';
      }, 300);
      
      const timeoutId = setTimeout(() => {
        icon.className = originalClass;
        button.classList.remove('added', 'btn-success');
        button.style.backgroundColor = '';
        button.style.color = '';
        button.style.transform = '';
        button.style.transition = '';
        delete button.dataset.animTimeout;
        delete button.dataset.originalIconClass;
      }, 1000);

      button.dataset.animTimeout = timeoutId.toString();
    }

    loadProducts(category) {
        const gridId = `product-grid-${category}`;
        const grid = document.getElementById(gridId);
        if (!grid) return;
        
        // Check if PRODUCTS exists
        if (!window.PRODUCTS || !window.PRODUCTS[category]) {
            grid.innerHTML = '<p class="loading">Chargement des produits...</p>';
            return;
        }

        const products = window.PRODUCTS[category];
        grid.innerHTML = '';
        
        if (products.length === 0) {
            grid.innerHTML = '<p class="no-products">Aucun produit dans cette catégorie.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.productId = product.id;
            
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-overlay">
                        <button class="add-to-cart-btn" data-product-id="${product.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${product.price.toLocaleString()} FCFA</p>
                </div>
            `;
            
            // Add listeners
            const img = card.querySelector('.product-image');
            const name = card.querySelector('.product-name');
            const btn = card.querySelector('.add-to-cart-btn');
            
            if (img) img.addEventListener('click', () => this.showProductModal(product));
            if (name) name.addEventListener('click', () => this.showProductModal(product));
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.addToCart(product, 1);
                    this.showAddedAnimation(btn);
                });
            }
            
            grid.appendChild(card);
        });
        
        // Re-run observer
        setTimeout(() => {
            if (typeof observeElements === 'function') observeElements();
        }, 100);
    }
}

// Initialize the shopping cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
    
    // Convert existing "Ajouter au panier" buttons to plus-only buttons (if any static ones exist)
    convertExistingButtons();
    
    // Fetch products
    fetchAndInitializeProducts();
});

// Helper function to get category from product ID
function getCategoryFromId(productId) {
    if (productId.startsWith('corporel')) return 'corporel';
    if (productId.startsWith('chambre')) return 'maison'; // Mappé vers maison
    if (productId.startsWith('thiouraye')) return 'maison'; // Mappé vers maison
    if (productId.startsWith('vetement')) return 'vetement'; // Supprimé mais gardé au cas où
    if (productId.startsWith('parfum')) return 'corporel'; // Default to corporel for generic parfums
    return 'corporel';
}

// Global function to load products (wrapper for cart.loadProducts)
window.loadProductsForCategory = function(category) {
    if (window.cart) {
        window.cart.loadProducts(category);
    }
};

// Add fade-in animation to elements as they come into view
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    });
  
    // Observe product cards for fade-in animation
    document.querySelectorAll('.product-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });
};
  
// Apply animations when products are loaded
setTimeout(observeElements, 600);

// Function to convert existing "Ajouter au panier" buttons to plus-only buttons
function convertExistingButtons() {
    const existingButtons = document.querySelectorAll('.add-to-cart-btn');
    
    existingButtons.forEach(button => {
      // Check if button still has text (not already converted)
      if (button.textContent.includes('Ajouter au panier')) {
        button.innerHTML = '<i class="fas fa-plus"></i>';
        
        // Add click handler if not already present
        if (!button.hasAttribute('data-handler-added')) {
          button.setAttribute('data-handler-added', 'true');
          button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = button.getAttribute('data-product-id');
            if (productId && window.cart) {
              // Find product data
              const product = findProductById(productId);
              if (product) {
                window.cart.addToCart(product, 1);
                window.cart.showAddedAnimation(button);
              }
            }
          });
        }
      }
    });
}

// Helper function to find product by ID
function findProductById(productId) {
    if (typeof window.PRODUCTS !== 'undefined') {
      for (const category in window.PRODUCTS) {
        const product = window.PRODUCTS[category].find(p => p.id === productId);
        if (product) return product;
      }
    }
    return null;
}

// Fetch products from aggregated JSON file
async function fetchAndInitializeProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) {
        console.warn('Products file not found. Ensure generate_index.js has been run.');
        return;
    }
    const products = await response.json();
    
    // Clear existing
    window.PRODUCTS = { corporel: [], maison: [] };
    
    // Distribute products
    products.forEach(product => {
        let category = product.category;
        // Normalize categories (handle legacy or CMS inconsistencies)
        if (category === 'chambre' || category === 'thiouraye') category = 'maison';
        
        if (!window.PRODUCTS[category]) window.PRODUCTS[category] = [];
        
        window.PRODUCTS[category].push(product);
    });
    
    console.log('Products loaded:', products.length);
    
    // Refresh view if on a category page
    if (window.currentCategory && window.cart) {
        window.cart.loadProducts(window.currentCategory);
    }
    
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}