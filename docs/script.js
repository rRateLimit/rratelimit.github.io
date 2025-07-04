// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Load saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeToggle(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
});

function updateThemeToggle(theme) {
    themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Rate Limit Demo
class RateLimitDemo {
    constructor() {
        this.limit = 3;
        this.interval = 1000; // milliseconds
        this.tokens = this.limit;
        this.lastRefill = Date.now();
        this.isRunning = false;
        this.requestCount = 0;
        this.intervalId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.limitInput = document.getElementById('limit');
        this.intervalInput = document.getElementById('interval');
        this.startButton = document.getElementById('start-demo');
        this.stopButton = document.getElementById('stop-demo');
        this.tokenCountEl = document.getElementById('token-count');
        this.tokenFillEl = document.getElementById('token-fill');
        this.logContainer = document.getElementById('request-log');
    }
    
    bindEvents() {
        this.limitInput.addEventListener('change', () => {
            this.limit = parseInt(this.limitInput.value);
            this.tokens = Math.min(this.tokens, this.limit);
            this.updateDisplay();
        });
        
        this.intervalInput.addEventListener('change', () => {
            this.interval = parseInt(this.intervalInput.value) * 1000;
        });
        
        this.startButton.addEventListener('click', () => this.start());
        this.stopButton.addEventListener('click', () => this.stop());
    }
    
    start() {
        this.isRunning = true;
        this.requestCount = 0;
        this.tokens = this.limit;
        this.lastRefill = Date.now();
        this.logContainer.innerHTML = '';
        
        this.startButton.disabled = true;
        this.stopButton.disabled = false;
        this.limitInput.disabled = true;
        this.intervalInput.disabled = true;
        
        this.updateDisplay();
        this.simulateRequests();
    }
    
    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        this.limitInput.disabled = false;
        this.intervalInput.disabled = false;
        
        this.addLog('デモを停止しました', 'info');
    }
    
    simulateRequests() {
        if (!this.isRunning) return;
        
        // Simulate random request intervals
        const nextRequestIn = Math.random() * 500 + 200; // 200-700ms
        
        setTimeout(() => {
            if (!this.isRunning) return;
            
            this.requestCount++;
            const allowed = this.allowRequest();
            
            if (allowed) {
                this.addLog(`リクエスト #${this.requestCount} 許可されました`, 'allowed');
            } else {
                this.addLog(`リクエスト #${this.requestCount} 拒否されました (レート制限超過)`, 'denied');
            }
            
            this.updateDisplay();
            
            // Continue simulation
            if (this.isRunning) {
                this.simulateRequests();
            }
        }, nextRequestIn);
    }
    
    allowRequest() {
        const now = Date.now();
        
        // Refill tokens if interval has passed
        if (now - this.lastRefill >= this.interval) {
            this.tokens = this.limit;
            this.lastRefill = now;
            this.addLog(`トークンが補充されました (${this.limit}個)`, 'info');
        }
        
        if (this.tokens > 0) {
            this.tokens--;
            return true;
        }
        
        return false;
    }
    
    updateDisplay() {
        this.tokenCountEl.textContent = this.tokens;
        const percentage = (this.tokens / this.limit) * 100;
        this.tokenFillEl.style.width = `${percentage}%`;
        
        // Update color based on token availability
        if (percentage > 50) {
            this.tokenFillEl.style.backgroundColor = 'var(--secondary-color)';
        } else if (percentage > 20) {
            this.tokenFillEl.style.backgroundColor = '#f59e0b';
        } else {
            this.tokenFillEl.style.backgroundColor = '#ef4444';
        }
    }
    
    addLog(message, type) {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const timestamp = new Date().toLocaleTimeString('ja-JP');
        entry.textContent = `[${timestamp}] ${message}`;
        
        this.logContainer.appendChild(entry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
        
        // Limit log entries to prevent memory issues
        if (this.logContainer.children.length > 50) {
            this.logContainer.removeChild(this.logContainer.firstChild);
        }
    }
}

// Initialize demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new RateLimitDemo();
});

// Add animation to feature cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe feature cards
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
});