document.addEventListener('DOMContentLoaded', () => {
    // Load games from global variable
    let gamesData = [];
    
    const loadGames = () => {
        try {
            // Use global gamesData variable instead of fetch
            if (window.gamesData && window.gamesData.games) {
                gamesData = window.gamesData.games;
                renderGames(gamesData);
                renderFeaturedGame();
                initializeEventListeners();
            } else {
                throw new Error('Game data not found');
            }
        } catch (error) {
            console.error('Failed to load games:', error);
            showErrorMessage();
        }
    };

    // Render games to the grid
    const renderGames = (games) => {
        const gamesGrid = document.querySelector('.games-grid');
        gamesGrid.innerHTML = '';
        
        games.forEach(game => {
            const gameCard = createGameCard(game);
            gamesGrid.appendChild(gameCard);
        });

        // Re-initialize observers for new cards
        initializeObservers();
    };

    // Create a game card element
    const createGameCard = (game) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-category', game.category);
        card.setAttribute('data-game-id', game.id);
        
        const stars = '★'.repeat(game.rating) + '☆'.repeat(5 - game.rating);
        
        card.innerHTML = `
            <div class="game-image" style="background-image: url('${game.image}'); background-size: cover; background-position: center;">
                <div class="game-overlay">
                    <button class="play-btn">プレイ</button>
                </div>
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-genre">${getCategoryName(game.category)}</p>
                <p class="game-description">${game.description}</p>
                <div class="game-rating">${stars}</div>
            </div>
        `;
        
        return card;
    };

    // Get category name in Japanese
    const getCategoryName = (category) => {
        const categories = {
            'action': 'アクション',
            'rpg': 'RPG',
            'puzzle': 'パズル',
            'strategy': 'ストラテジー',
            'renai': '恋愛'
        };
        return categories[category] || category;
    };

    // Render featured game in hero section
    const renderFeaturedGame = () => {
        const featuredGames = gamesData.filter(game => game.featured);
        if (featuredGames.length === 0) return;
        
        const featuredGame = featuredGames[Math.floor(Math.random() * featuredGames.length)];
        const featuredContainer = document.querySelector('.featured-game');
        
        if (featuredContainer) {
            featuredContainer.innerHTML = `
                <div class="featured-img" style="background-image: url('${featuredGame.image}'); background-size: cover; background-position: center;"></div>
                <h3>${featuredGame.title}</h3>
                <p>${featuredGame.description}</p>
            `;
        }
    };

    // Show error message if games fail to load
    const showErrorMessage = () => {
        const gamesGrid = document.querySelector('.games-grid');
        gamesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <p style="color: var(--text-gray);">ゲームの読み込みに失敗しました。後でもう一度お試しください。</p>
            </div>
        `;
    };

    // Initialize all event listeners
    const initializeEventListeners = () => {
        // Smooth scrolling for navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                // 外部リンクの場合はデフォルトの動作を許可
                if (href.startsWith('http') || href.startsWith('//')) {
                    return; // 通常のリンク動作を実行
                }
                // 内部リンクの場合のみスムーズスクロール
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Category filter functionality
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const category = button.getAttribute('data-category');
                const filteredGames = category === 'all' 
                    ? gamesData 
                    : gamesData.filter(game => game.category === category);
                
                renderGames(filteredGames);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.querySelector('.search-btn');

        const performSearch = () => {
            const searchTerm = searchInput.value.toLowerCase();
            
            if (searchTerm === '') {
                renderGames(gamesData);
                return;
            }
            
            const filteredGames = gamesData.filter(game => 
                game.title.toLowerCase().includes(searchTerm) ||
                game.description.toLowerCase().includes(searchTerm) ||
                game.category.toLowerCase().includes(searchTerm)
            );
            
            renderGames(filteredGames);
        };

        searchInput.addEventListener('input', performSearch);
        searchBtn.addEventListener('click', performSearch);

        // Parallax effect for hero section
        const heroParticles = document.querySelector('.hero-particles');
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            
            if (heroParticles) {
                heroParticles.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            }
        });

        // CTA button hover effect
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('mousemove', (e) => {
                const rect = ctaButton.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ctaButton.style.setProperty('--x', `${x}px`);
                ctaButton.style.setProperty('--y', `${y}px`);
            });
        }
    };

    // Initialize observers for animations
    const initializeObservers = () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all game cards
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });

        // Re-initialize play button listeners
        initializePlayButtons();
    };

    // Initialize play button click handlers
    const initializePlayButtons = () => {
        const playButtons = document.querySelectorAll('.play-btn');
        
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Create ripple effect
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
                
                // Get game info
                const gameCard = e.target.closest('.game-card');
                const gameId = gameCard.getAttribute('data-game-id');
                const game = gamesData.find(g => g.id === parseInt(gameId));
                
                if (game) {
                    if (game.playUrl) {
                        // 新しいタブでゲームを開く
                        window.open(game.playUrl, '_blank');
                        console.log(`ゲーム「${game.title}」を起動中...`);
                    } else {
                        console.log(`ゲーム「${game.title}」のURLが設定されていません`);
                        alert(`申し訳ありません。「${game.title}」はまだプレイできません。`);
                    }
                }
            });
        });
    };

    // Dynamic background particles
    const createParticle = () => {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 5 + 2;
        const duration = Math.random() * 20 + 10;
        const startX = Math.random() * window.innerWidth;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${startX}px`;
        particle.style.animationDuration = `${duration}s`;
        
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg) {
            heroBg.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, duration * 1000);
        }
    };

    // Create particles periodically
    setInterval(createParticle, 2000);

    // Add CSS for particles and ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .game-description {
            color: var(--text-gray);
            font-size: 0.9rem;
            margin: 0.5rem 0;
            line-height: 1.4;
        }
        
        .game-image {
            position: relative;
            height: 200px;
            overflow: hidden;
        }
        
        .particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            opacity: 0;
            bottom: -10px;
            animation: float-up linear infinite;
        }
        
        @keyframes float-up {
            0% {
                opacity: 0;
                transform: translateY(0) scale(0);
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                opacity: 0;
                transform: translateY(-100vh) scale(1);
            }
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .play-btn {
            position: relative;
            overflow: hidden;
        }
        
        .cta-button {
            position: relative;
            overflow: hidden;
        }
        
        .cta-button::before {
            content: '';
            position: absolute;
            top: var(--y, 50%);
            left: var(--x, 50%);
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transition: width 0.6s, height 0.6s;
            transform: translate(-50%, -50%);
        }
        
        .cta-button:hover::before {
            width: 300px;
            height: 300px;
        }
    `;
    document.head.appendChild(style);

    // Load games on page load
    loadGames();
});
