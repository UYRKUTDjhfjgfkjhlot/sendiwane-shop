// Cart management and main application logic
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
          e.preventDefault();
          this.addToCart(this.currentProduct, this.currentQuantity);
          this.hideModal(document.getElementById('product-modal'));
          this.showCheckoutModal();
        });
      }
    }
  
    setupCartModalControls() {
      const proceedCheckoutBtn = document.getElementById('proceed-checkout');
      if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', () => {
          this.hideModal(document.getElementById('cart-modal'));
          this.showCheckoutModal();
        });
      }
    }
  
    setupCheckoutForm() {
      const checkoutForm = document.getElementById('checkout-form');
      if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.processCheckout(new FormData(checkoutForm));
        });
      }
    }
  
    loadProducts(category) {
      // Try to find category-specific grid first (for SPA), then fallback to generic 'product-grid'
      const productGrid = document.getElementById(`product-grid-${category}`) || document.getElementById('product-grid');
      if (!productGrid || !PRODUCTS[category]) return;

      // Check if already loaded to avoid reloading
      if (productGrid.children.length > 0 && !productGrid.querySelector('.loading')) return;

      productGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Chargement des produits...</p></div>';

      // Simulate loading delay for better UX
      setTimeout(() => {
        const products = PRODUCTS[category];
        productGrid.innerHTML = '';

        products.forEach(product => {
          const productCard = this.createProductCard(product);
          productGrid.appendChild(productCard);
        });
      }, 500);
    }
  
    createProductCard(product) {
      const card = document.createElement('div');
      card.className = 'product-card';
      
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">${this.formatPrice(product.price)}</p>
          <button class="add-to-cart-btn" data-product-id="${product.id}">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      `;
  
      // Add click handlers
      card.querySelector('.product-image').addEventListener('click', () => {
        this.showProductModal(product);
      });
  
      card.querySelector('.product-info h3').addEventListener('click', () => {
        this.showProductModal(product);
      });
  
      card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.addToCart(product, 1);
        this.showAddedAnimation(e.target);
      });
  
      return card;
    }
  
    showProductModal(product) {
      this.currentProduct = product;
      this.currentQuantity = 1;
      
      const modal = document.getElementById('product-modal');
      const productImage = document.getElementById('modal-product-image');
      const productName = document.getElementById('modal-product-name');
      const productPrice = document.getElementById('modal-product-price');
  
      if (productImage) productImage.src = product.image;
      if (productName) productName.textContent = product.name;
      if (productPrice) productPrice.textContent = this.formatPrice(product.price);
  
      this.updateProductModal();
      this.showModal(modal);
    }
  
    updateProductModal() {
      const quantityDisplay = document.getElementById('modal-quantity');
      const modalTotal = document.getElementById('modal-total');
  
      if (quantityDisplay) {
        quantityDisplay.textContent = this.currentQuantity;
      }
  
      if (modalTotal && this.currentProduct) {
        const total = this.currentProduct.price * this.currentQuantity;
        modalTotal.textContent = this.formatPrice(total);
      }
    }
  
    showCartModal() {
      const modal = document.getElementById('cart-modal');
      this.updateCartDisplay();
      this.showModal(modal);
    }
  
    showCheckoutModal() {
      const modal = document.getElementById('checkout-modal');
      const checkoutTotal = document.getElementById('checkout-total-price');
      
      if (checkoutTotal) {
        checkoutTotal.textContent = this.formatPrice(this.getCartTotal());
      }
      
      this.showModal(modal);
    }
  
    showModal(modal) {
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    }
  
    hideModal(modal) {
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }
  
    addToCart(product, quantity = 1) {
      const existingItem = this.items.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: quantity
        });
      }
  
      this.saveCart();
      this.updateCartBadge();
      this.updateCartDisplay();
    }
  
    removeFromCart(productId) {
      this.items = this.items.filter(item => item.id !== productId);
      this.saveCart();
      this.updateCartBadge();
      this.updateCartDisplay();
    }
  
    updateCartBadge() {
      const badge = document.getElementById('cart-badge');
      if (badge) {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.classList.toggle('visible', totalItems > 0);
      }
    }
  
    updateCartDisplay() {
      const cartItems = document.getElementById('cart-items');
      const cartTotal = document.getElementById('cart-total-price');
  
      if (!cartItems) return;
  
      if (this.items.length === 0) {
        cartItems.innerHTML = `
          <div class="empty-cart">
            <i class="fas fa-shopping-cart"></i>
            <p>Votre panier est vide</p>
          </div>
        `;
      } else {
        cartItems.innerHTML = this.items.map(item => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">${this.formatPrice(item.price)}</div>
              <div class="cart-item-quantity">Quantité: ${item.quantity}</div>
            </div>
            <button class="remove-item-btn" data-product-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `).join('');
  
        // Add remove item listeners
        cartItems.querySelectorAll('.remove-item-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const productId = e.target.closest('.remove-item-btn').dataset.productId;
            this.removeFromCart(productId);
          });
        });
      }
  
      if (cartTotal) {
        cartTotal.textContent = this.formatPrice(this.getCartTotal());
      }
    }
  
    getCartTotal() {
      return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
  
    processCheckout(formData) {
      const name = formData.get('name');
      const phone = formData.get('phone');
      const address = formData.get('address');
  
      if (!name || !phone || !address) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
  
      // Generate WhatsApp message
      const message = this.generateWhatsAppMessage(name, phone, address);
      
      // Submit button animation
      const submitBtn = document.querySelector('#checkout-form button[type="submit"]');
      if (submitBtn) {
        submitBtn.focus();
        setTimeout(() => {
          this.sendToWhatsApp(message);
          this.clearCart();
          this.hideModal(document.getElementById('checkout-modal'));
          this.showSuccessMessage();
        }, 2000);
      }
    }
  
    generateWhatsAppMessage(name, phone, address) {
      let message = `🛍️ *NOUVELLE COMMANDE - SEN DIWANE TOUHFATOU*\n\n`;
      message += `👤 *Client:* ${name}\n`;
      message += `📱 *Téléphone:* ${phone}\n`;
      message += `📍 *Adresse:* ${address}\n\n`;
      message += `🛒 *PRODUITS COMMANDÉS:*\n`;
      
      this.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   • Prix unitaire: ${this.formatPrice(item.price)}\n`;
        message += `   • Quantité: ${item.quantity}\n`;
        message += `   • Sous-total: ${this.formatPrice(item.price * item.quantity)}\n\n`;
      });
  
      message += `💰 *TOTAL À PAYER: ${this.formatPrice(this.getCartTotal())}*\n\n`;
      message += `📝 Merci de confirmer cette commande et m'indiquer les modalités de livraison.`;
  
      return message;
    }
  
    sendToWhatsApp(message) {
      const phone = '221781965641'; // Replace with actual WhatsApp business number
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
    }
  
    showSuccessMessage() {
      alert('Votre commande a été envoyée avec succès! Vous allez être redirigé vers WhatsApp pour finaliser.');
    }
  
    showAddedAnimation(button) {
      const icon = button.querySelector('i');
      if (!icon) return;
      const originalClass = icon.className;
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
      setTimeout(() => {
        icon.className = originalClass;
        button.classList.remove('added', 'btn-success');
        button.style.backgroundColor = '';
        button.style.color = '';
        button.style.transform = '';
        button.style.transition = '';
      }, 2000);
    }
  
    formatPrice(price) {
      return `${price.toLocaleString('fr-FR')} FCFA`;
    }
  
    saveCart() {
      localStorage.setItem('sen-diwane-cart', JSON.stringify(this.items));
    }
  
    loadCart() {
      try {
        const saved = localStorage.getItem('sen-diwane-cart');
        return saved ? JSON.parse(saved) : [];
      } catch (error) {
        console.error('Error loading cart:', error);
        return [];
      }
    }
  
    clearCart() {
      this.items = [];
      this.saveCart();
      this.updateCartBadge();
      this.updateCartDisplay();
    }
  }
  
  // Initialize the shopping cart when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
    
    // Initialize static product cards if they exist
    initializeStaticProductCards();
    
    // Convert existing "Ajouter au panier" buttons to plus-only buttons
    convertExistingButtons();
  });
  
  // Function to initialize static product cards
  function initializeStaticProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
      const productId = card.dataset.productId;
      const productImage = card.querySelector('.product-image');
      const productName = card.querySelector('.product-name');
      const productPrice = card.querySelector('.product-price');
      const addToCartBtn = card.querySelector('.add-to-cart-btn');
      
      if (productId && productImage && productName && productPrice) {
        // Create product object from static data
        const product = {
          id: productId,
          name: productName.textContent,
          price: parseFloat(productPrice.textContent.replace(/[^\d]/g, '')),
          image: productImage.src,
          category: getCategoryFromId(productId)
        };
        
        // Add click handlers for product details
        productImage.addEventListener('click', () => {
          window.cart.showProductModal(product);
        });
        
        productName.addEventListener('click', () => {
          window.cart.showProductModal(product);
        });
        
        // Add click handler for add to cart button
        if (addToCartBtn) {
          addToCartBtn.innerHTML = '<i class="fas fa-plus"></i>';
          addToCartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.cart.addToCart(product, 1);
            window.cart.showAddedAnimation(e.target);
          });
        }
      }
    });
  }
  
  // Helper function to get category from product ID
  function getCategoryFromId(productId) {
    if (productId.startsWith('corporel')) return 'corporel';
    if (productId.startsWith('chambre')) return 'chambre';
    if (productId.startsWith('thiouraye')) return 'thiouraye';
    if (productId.startsWith('vetement')) return 'vetement';
    if (productId.startsWith('parfum')) return 'corporel'; // Default to corporel for generic parfums
    return 'corporel';
  }
  
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
    if (typeof PRODUCTS !== 'undefined') {
      for (const category in PRODUCTS) {
        const product = PRODUCTS[category].find(p => p.id === productId);
        if (product) return product;
      }
    }
    return null;
  }
  