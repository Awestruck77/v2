/**
 * Main JavaScript for Game Price Tracker
 */

// Global app object
window.GameTracker = {
    // Configuration
    config: {
        apiBaseUrl: '/api',
        refreshInterval: 300000, // 5 minutes
        notificationDuration: 3000 // 3 seconds
    },
    
    // State management
    state: {
        currentRegion: localStorage.getItem('region') || 'US',
        currentTheme: localStorage.getItem('theme') || 'game',
        wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]'),
        priceAlerts: JSON.parse(localStorage.getItem('priceAlerts') || '[]')
    },
    
    // Initialize the application
    init() {
        this.setupEventListeners();
        this.loadUserPreferences();
        this.startAutoRefresh();
        console.log('Game Price Tracker initialized');
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('[data-mobile-menu]');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', this.toggleMobileMenu);
        }
        
        // Theme switcher
        const themeButtons = document.querySelectorAll('[data-theme-btn]');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.setTheme(theme);
            });
        });
        
        // Region selector
        const regionSelect = document.querySelector('[data-region-select]');
        if (regionSelect) {
            regionSelect.addEventListener('change', (e) => {
                this.setRegion(e.target.value);
            });
        }
        
        // Search form
        const searchForm = document.querySelector('[data-search-form]');
        if (searchForm) {
            searchForm.addEventListener('submit', this.handleSearch);
        }
        
        // Wishlist buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-wishlist-btn]')) {
                const gameId = e.target.dataset.gameId;
                const action = e.target.dataset.action;
                
                if (action === 'add') {
                    this.addToWishlist(gameId);
                } else if (action === 'remove') {
                    this.removeFromWishlist(gameId);
                }
            }
        });
        
        // Price alert buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-price-alert-btn]')) {
                const gameId = e.target.dataset.gameId;
                this.setPriceAlert(gameId);
            }
        });
    },
    
    // Load user preferences
    loadUserPreferences() {
        // Set theme
        this.setTheme(this.state.currentTheme);
        
        // Set region
        const regionSelect = document.querySelector('[data-region-select]');
        if (regionSelect) {
            regionSelect.value = this.state.currentRegion;
        }
        
        // Update wishlist buttons
        this.updateWishlistButtons();
    },
    
    // Theme management
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.state.currentTheme = theme;
        
        // Update theme buttons
        document.querySelectorAll('[data-theme-btn]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    },
    
    // Region management
    setRegion(region) {
        this.state.currentRegion = region;
        localStorage.setItem('region', region);
        
        // Send to server
        fetch('/api/region', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ region: region })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('Region updated successfully', 'success');
                // Reload page to update prices
                setTimeout(() => location.reload(), 1000);
            }
        })
        .catch(error => {
            console.error('Error setting region:', error);
            this.showNotification('Failed to update region', 'error');
        });
    },
    
    // Mobile menu toggle
    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    },
    
    // Search handling
    handleSearch(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const query = formData.get('q');
        
        if (query.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
    },
    
    // Wishlist management
    addToWishlist(gameId) {
        if (!this.isLoggedIn()) {
            this.showNotification('Please log in to use wishlist', 'warning');
            return;
        }
        
        fetch('/api/wishlist/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ game_id: parseInt(gameId) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('Added to wishlist!', 'success');
                this.updateWishlistButton(gameId, true);
                
                // Update local state
                if (!this.state.wishlist.includes(gameId)) {
                    this.state.wishlist.push(gameId);
                    localStorage.setItem('wishlist', JSON.stringify(this.state.wishlist));
                }
            } else {
                this.showNotification(data.error || 'Failed to add to wishlist', 'error');
            }
        })
        .catch(error => {
            console.error('Error adding to wishlist:', error);
            this.showNotification('Failed to add to wishlist', 'error');
        });
    },
    
    removeFromWishlist(gameId) {
        fetch('/api/wishlist/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ game_id: parseInt(gameId) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('Removed from wishlist!', 'success');
                this.updateWishlistButton(gameId, false);
                
                // Update local state
                this.state.wishlist = this.state.wishlist.filter(id => id !== gameId);
                localStorage.setItem('wishlist', JSON.stringify(this.state.wishlist));
            } else {
                this.showNotification(data.error || 'Failed to remove from wishlist', 'error');
            }
        })
        .catch(error => {
            console.error('Error removing from wishlist:', error);
            this.showNotification('Failed to remove from wishlist', 'error');
        });
    },
    
    updateWishlistButton(gameId, isInWishlist) {
        const button = document.querySelector(`[data-game-id="${gameId}"][data-wishlist-btn]`);
        if (button) {
            if (isInWishlist) {
                button.innerHTML = '<i class="fas fa-heart text-red-500"></i>';
                button.dataset.action = 'remove';
                button.title = 'Remove from wishlist';
            } else {
                button.innerHTML = '<i class="far fa-heart text-gray-400"></i>';
                button.dataset.action = 'add';
                button.title = 'Add to wishlist';
            }
        }
    },
    
    updateWishlistButtons() {
        document.querySelectorAll('[data-wishlist-btn]').forEach(button => {
            const gameId = button.dataset.gameId;
            const isInWishlist = this.state.wishlist.includes(gameId);
            this.updateWishlistButton(gameId, isInWishlist);
        });
    },
    
    // Price alerts
    setPriceAlert(gameId) {
        if (!this.isLoggedIn()) {
            this.showNotification('Please log in to set price alerts', 'warning');
            return;
        }
        
        const targetPrice = prompt('Enter your target price (USD):');
        if (targetPrice && !isNaN(targetPrice) && parseFloat(targetPrice) > 0) {
            fetch('/api/price-alert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    game_id: parseInt(gameId),
                    target_price: parseFloat(targetPrice)
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showNotification(`Price alert set for $${targetPrice}!`, 'success');
                } else {
                    this.showNotification(data.error || 'Failed to set price alert', 'error');
                }
            })
            .catch(error => {
                console.error('Error setting price alert:', error);
                this.showNotification('Failed to set price alert', 'error');
            });
        }
    },
    
    // Utility functions
    isLoggedIn() {
        return document.body.dataset.userLoggedIn === 'true';
    },
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, this.config.notificationDuration);
    },
    
    // Auto-refresh functionality
    startAutoRefresh() {
        setInterval(() => {
            this.refreshDeals();
        }, this.config.refreshInterval);
    },
    
    refreshDeals() {
        fetch(`${this.config.apiBaseUrl}/deals?region=${this.state.currentRegion}`)
            .then(response => response.json())
            .then(data => {
                console.log('Deals refreshed:', data.length);
                // Update UI if needed
            })
            .catch(error => {
                console.error('Error refreshing deals:', error);
            });
    },
    
    // Format price based on region
    formatPrice(price, currency = 'USD') {
        const formatters = {
            'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
            'EUR': new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
            'GBP': new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
            'INR': new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
            'CAD': new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }),
            'AUD': new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })
        };
        
        const formatter = formatters[currency] || formatters['USD'];
        return formatter.format(price);
    },
    
    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    // Format time ago
    timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.GameTracker.init();
});

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);