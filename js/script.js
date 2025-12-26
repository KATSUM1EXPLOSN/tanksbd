// Основная логика приложения
class TankDatabase {
    constructor() {
        this.currentVersion = 'wot';
        this.filteredTanks = [];
        this.currentPage = 1;
        this.tanksPerPage = 12;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTanks();
        this.updateResultsCount();
    }

    bindEvents() {
        // Переключение версий
        document.querySelectorAll('.version-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.version-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentVersion = e.target.dataset.version;
                this.currentPage = 1;
                this.loadTanks();
            });
        });

        // Фильтры
        document.getElementById('nation-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('type-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('tier-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('search-input').addEventListener('input', () => this.applyFilters());

        // Очистка фильтров
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());

        // Модальное окно
        const modal = document.getElementById('tank-modal');
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'tank-modal' || e.target.classList.contains('close')) {
                this.closeModal();
            }
        });

        // Закрытие модального окна по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    loadTanks() {
        const tanks = tankDatabase[this.currentVersion] || [];
        this.filteredTanks = [...tanks];
        this.renderTanks();
        this.updateResultsCount();
    }

    applyFilters() {
        const nation = document.getElementById('nation-filter').value;
        const type = document.getElementById('type-filter').value;
        const tier = document.getElementById('tier-filter').value;
        const search = document.getElementById('search-input').value.toLowerCase();

        const tanks = tankDatabase[this.currentVersion] || [];
        
        this.filteredTanks = tanks.filter(tank => {
            const matchesNation = !nation || tank.nation === nation;
            const matchesType = !type || tank.type === type;
            const matchesTier = !tier || tank.tier.toString() === tier;
            const matchesSearch = !search || tank.name.toLowerCase().includes(search);
            
            return matchesNation && matchesType && matchesTier && matchesSearch;
        });

        this.currentPage = 1;
        this.renderTanks();
        this.updateResultsCount();
    }

    clearFilters() {
        document.getElementById('nation-filter').value = '';
        document.getElementById('type-filter').value = '';
        document.getElementById('tier-filter').value = '';
        document.getElementById('search-input').value = '';
        this.loadTanks();
    }

    updateResultsCount() {
        const count = this.filteredTanks.length;
        document.getElementById('results-count').innerHTML = `Найдено танков: <strong>${count}</strong>`;
    }

    renderTanks() {
        const grid = document.getElementById('tanks-grid');
        
        if (this.filteredTanks.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Танки не найдены</h3>
                    <p>Попробуйте изменить параметры поиска или очистить фильтры</p>
                </div>
            `;
            return;
        }

        // Пагинация
        const startIndex = (this.currentPage - 1) * this.tanksPerPage;
        const endIndex = startIndex + this.tanksPerPage;
        const tanksToShow = this.filteredTanks.slice(startIndex, endIndex);

        // Создаем HTML с улучшенной структурой
        grid.innerHTML = tanksToShow.map((tank, index) => `
            <div class="tank-card" onclick="app.showTankDetails(${tank.id})" style="animation-delay: ${index * 0.1}s">
                <div class="tank-header">
                    <div class="tank-name">${tank.name}</div>
                    <div class="tank-tier ${this.getTierClass(tank.tier)}">${this.getTierRoman(tank.tier)}</div>
                </div>
                <div class="tank-info">
                    <span><i class="fas fa-flag"></i> ${this.getNationName(tank.nation)}</span>
                    <span><i class="${this.getTypeIcon(tank.type)}"></i> ${this.getTypeName(tank.type)}</span>
                </div>
                <div class="tank-stats">
                    <div class="stat" title="Прочность">
                        <span class="stat-value">${tank.hp}</span>
                        <span class="stat-label">HP</span>
                    </div>
                    <div class="stat" title="Урон за выстрел">
                        <span class="stat-value">${tank.damage}</span>
                        <span class="stat-label">Урон</span>
                    </div>
                    <div class="stat" title="Пробитие">
                        <span class="stat-value">${tank.penetration}</span>
                        <span class="stat-label">Пробитие</span>
                    </div>
                    <div class="stat" title="Максимальная скорость">
                        <span class="stat-value">${tank.speed}</span>
                        <span class="stat-label">Скорость</span>
                    </div>
                </div>
                <div class="tank-rating">
                    ${this.renderMiniRating(tank.stats)}
                </div>
            </div>
        `).join('');

        // Запускаем анимацию появления
        this.animateCards();
    }

    animateCards() {
        const cards = document.querySelectorAll('.tank-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.95)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, index * 100);
        });
    }

    getTierClass(tier) {
        if (tier <= 3) return 'tier-low';
        if (tier <= 6) return 'tier-medium';
        if (tier <= 8) return 'tier-high';
        if (tier === 11) return 'tier-premium';
        return 'tier-top';
    }

    getTypeIcon(type) {
        const icons = {
            'heavy': 'fas fa-shield-alt',
            'medium': 'fas fa-balance-scale',
            'light': 'fas fa-tachometer-alt',
            'td': 'fas fa-crosshairs',
            'spg': 'fas fa-bomb'
        };
        return icons[type] || 'fas fa-tank';
    }

    renderMiniRating(stats) {
        const maxStat = Math.max(...Object.values(stats));
        return `
            <div class="mini-rating">
                ${Object.entries(stats).map(([key, value]) => `
                    <div class="mini-stat" title="${this.getStatName(key)}: ${value}/100">
                        <div class="mini-stat-bar">
                            <div class="mini-stat-fill" style="width: ${value}%; background: ${this.getStatColor(key)}"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getStatColor(stat) {
        const colors = {
            'firepower': '#ff4444',
            'armor': '#4444ff',
            'mobility': '#44ff44',
            'concealment': '#ffff44'
        };
        return colors[stat] || '#ff6b35';
    }

    showTankDetails(tankId) {
        const tank = this.filteredTanks.find(t => t.id === tankId) || 
                     tankDatabase[this.currentVersion].find(t => t.id === tankId);
        if (!tank) return;

        const modal = document.getElementById('tank-modal');
        const details = document.getElementById('tank-details');
        
        details.innerHTML = `
            <h2><i class="fas fa-tank"></i> ${tank.name}</h2>
            <p style="color: #cccccc; margin-bottom: 30px; font-size: 1.1rem; line-height: 1.6;">${tank.description}</p>
            
            <div class="details-grid">
                <div class="detail-section">
                    <h3><i class="fas fa-info-circle"></i> Основные характеристики</h3>
                    <div class="detail-item">
                        <span class="detail-label">Уровень:</span>
                        <span class="detail-value">${this.getTierRoman(tank.tier)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Нация:</span>
                        <span class="detail-value">${this.getNationName(tank.nation)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Тип:</span>
                        <span class="detail-value">${this.getTypeName(tank.type)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Прочность:</span>
                        <span class="detail-value">${tank.hp} HP</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Урон:</span>
                        <span class="detail-value">${tank.damage}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Пробитие:</span>
                        <span class="detail-value">${tank.penetration} мм</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Броня:</span>
                        <span class="detail-value">${tank.armor} мм</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Скорость:</span>
                        <span class="detail-value">${tank.speed} км/ч</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Обзор:</span>
                        <span class="detail-value">${tank.viewRange} м</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3><i class="fas fa-chart-bar"></i> Рейтинг характеристик</h3>
                    ${this.renderStatBars(tank.stats)}
                </div>
            </div>

            <div class="guide-section">
                <h3><i class="fas fa-book"></i> Гайд по игре</h3>
                
                <h4><i class="fas fa-chess"></i> Тактика:</h4>
                <p>${tank.guide.tactics}</p>
                
                <h4><i class="fas fa-tools"></i> Рекомендуемое оборудование:</h4>
                <ul>
                    ${tank.guide.equipment.map(item => `<li><i class="fas fa-cog"></i> ${item}</li>`).join('')}
                </ul>
                
                <h4><i class="fas fa-users"></i> Навыки экипажа:</h4>
                <ul>
                    ${tank.guide.crew.map(skill => `<li><i class="fas fa-star"></i> ${skill}</li>`).join('')}
                </ul>
                
                <h4><i class="fas fa-thumbs-up"></i> Сильные стороны:</h4>
                <ul>
                    ${tank.guide.strengths.map(strength => `<li><i class="fas fa-plus-circle" style="color: #4CAF50;"></i> ${strength}</li>`).join('')}
                </ul>
                
                <h4><i class="fas fa-thumbs-down"></i> Слабые стороны:</h4>
                <ul>
                    ${tank.guide.weaknesses.map(weakness => `<li><i class="fas fa-minus-circle" style="color: #f44336;"></i> ${weakness}</li>`).join('')}
                </ul>
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Анимация появления модального окна
        setTimeout(() => {
            modal.querySelector('.modal-content').style.transform = 'scale(1)';
            modal.querySelector('.modal-content').style.opacity = '1';
        }, 10);
    }

    renderStatBars(stats) {
        return Object.entries(stats).map(([key, value]) => `
            <div class="detail-item">
                <span class="detail-label">${this.getStatName(key)}:</span>
                <div class="stat-bar-container">
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width: ${value}%"></div>
                    </div>
                    <span class="detail-value">${value}/100</span>
                </div>
            </div>
        `).join('');
    }

    closeModal() {
        const modal = document.getElementById('tank-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    getTierRoman(tier) {
        const romans = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
        return romans[tier] || tier;
    }

    getNationName(nation) {
        const names = {
            'ussr': 'СССР',
            'germany': 'Германия',
            'usa': 'США',
            'france': 'Франция',
            'uk': 'Великобритания',
            'china': 'Китай',
            'japan': 'Япония',
            'czech': 'Чехословакия',
            'sweden': 'Швеция',
            'poland': 'Польша',
            'italy': 'Италия'
        };
        return names[nation] || nation;
    }

    getTypeName(type) {
        const names = {
            'heavy': 'Тяжелый танк',
            'medium': 'Средний танк',
            'light': 'Легкий танк',
            'td': 'ПТ-САУ',
            'spg': 'Артиллерия'
        };
        return names[type] || type;
    }

    getStatName(stat) {
        const names = {
            'firepower': 'Огневая мощь',
            'armor': 'Бронирование',
            'mobility': 'Подвижность',
            'concealment': 'Незаметность'
        };
        return names[stat] || stat;
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, создаем приложение...');
    
    if (typeof tankDatabase === 'undefined') {
        console.error('❌ tankDatabase не найден при инициализации!');
        return;
    }
    
    console.log('✅ tankDatabase найден, создаем приложение...');
    window.app = new TankDatabase();
    console.log('✅ Приложение создано успешно!');
});

// Дополнительные функции для улучшения UX
document.addEventListener('DOMContentLoaded', function() {
    // Плавная прокрутка к результатам при фильтрации
    const filters = document.querySelectorAll('.filters select, .filters input');
    filters.forEach(filter => {
        filter.addEventListener('change', () => {
            setTimeout(() => {
                document.querySelector('.tanks-grid').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        });
    });

    // Анимация загрузки
    setTimeout(() => {
        document.querySelector('.tanks-grid .loading')?.remove();
    }, 500);
});
