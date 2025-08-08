/**
 * 🤖 Chatbot Web Iniettabile - Versione Vanilla JavaScript
 * 🎯 Scopo: Entry point principale per il chatbot autonomo
 * 📦 Versione: 1.0.0
 * 🔧 Uso: window.Chatbot.init({ language: 'it' })
 */

(function() {
    'use strict';

    // 🚫 Previeni inizializzazione multipla
    if (window.Chatbot) {
        console.warn('🤖 Chatbot già inizializzato');
        return;
    }

    /**
     * 🎨 MODULO: ChatbotThemeManager
     * 🎯 Scopo: Gestisce i temi del chatbot
     * 📋 Responsabilità: Applicazione temi, persistenza, transizioni smooth
     */
    const ChatbotThemeManager = {
        /**
         * 🎨 Definizione temi disponibili
         */
        themes: {
            classic: {
                name: 'Classic',
                colors: {
                    // Colori primari - Wine Theme Light
                    '--chatbot-primary': '#E94744',
                    '--chatbot-primary-hover': '#D63C25',
                    '--chatbot-primary-light': '#FFEDEF',
                    '--chatbot-modal-text': 'black',
                    // Sfondo e superficie
                    '--chatbot-bg': '#ffffff',
                    '--chatbot-surface': 'white',
                    '--chatbot-border': '#F0E4E7',
                    // Testo
                    '--chatbot-text-primary': '#2C1F21',
                    '--chatbot-text-secondary': '#7A5A60',
                    '--chatbot-text-inverse': '#ffffff',
                    '--chatbot-footer-text': 'white',
                    // Messaggi
                    '--chatbot-message-user-bg': '#FFEDEF',
                    '--chatbot-message-user-text': '#484848',
                    '--chatbot-message-bot-bg': '#FFEDEF',
                    '--chatbot-message-bot-text': '#777777'
                }
            },
            'dark-wine': {
                name: 'Dark-Wine',
                colors: {
                    // Colori primari - Wine Theme Dark
                    '--chatbot-primary': '#722F37',
                }
            }
        },

        /**
         * 📝 Proprietà del modulo
         */
        shadowRoot: null,
        currentTheme: null,
        
        /**
         * 🎯 Scopo: Inizializza il theme manager
         * 📥 Input: shadowRoot (ShadowRoot)
         * 📤 Output: Theme manager inizializzato
         */
        init(shadowRoot) {
            this.shadowRoot = shadowRoot;
            this.currentTheme = this.loadThemeFromStorage();
            this.applyTheme(this.currentTheme);
        },

        /**
         * 🎯 Scopo: Carica tema salvato da localStorage
         * 📥 Input: Nessuno
         * 📤 Output: Nome tema salvato o 'classic' come default
         */
        loadThemeFromStorage() {
            const savedTheme = localStorage.getItem('chatbot-theme');
            return savedTheme && this.themes[savedTheme] ? savedTheme : 'classic';
        },

        /**
         * 🎯 Scopo: Applica tema al chatbot
         * 📥 Input: themeName (string)
         * 📤 Output: Tema applicato
         */
        applyTheme(themeName) {
            if (!this.themes[themeName] || !this.shadowRoot) return;

            const theme = this.themes[themeName];
            const hostElement = this.shadowRoot.host;

            // Applica transizione smooth
            hostElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

            // Applica le variabili CSS del tema
            Object.entries(theme.colors).forEach(([property, value]) => {
                hostElement.style.setProperty(property, value);
            });

            // Salva tema corrente
            this.currentTheme = themeName;
            localStorage.setItem('chatbot-theme', themeName);

            // Aggiorna UI del selettore
            this.updateThemeSelector();
        },

        /**
         * 🎯 Scopo: Aggiorna l'interfaccia del selettore tema
         * 📥 Input: Nessuno
         * 📤 Output: UI aggiornata
         */
        updateThemeSelector() {
            if (!this.shadowRoot) return;

            const selector = this.shadowRoot.querySelector('.chatbot-theme-selector');
            if (!selector) return;

            const currentDisplay = selector.querySelector('.chatbot-theme-current');
            const options = selector.querySelectorAll('.chatbot-theme-option');

            if (currentDisplay) {
                currentDisplay.textContent = this.themes[this.currentTheme].name;
            }

            options.forEach(option => {
                const themeName = option.dataset.theme;
                option.classList.toggle('chatbot-theme-option--active', themeName === this.currentTheme);
            });
        },

        /**
         * 🎯 Scopo: Ottiene lista temi disponibili
         * 📥 Input: Nessuno
         * 📤 Output: Array di temi disponibili
         */
        getAvailableThemes() {
            return Object.keys(this.themes);
        },

        /**
         * 🎯 Scopo: Ottiene tema corrente
         * 📥 Input: Nessuno
         * 📤 Output: Nome tema corrente
         */
        getCurrentTheme() {
            return this.currentTheme;
        }
    };

    /**
     * 🎨 MODULO: ChatbotUI
     * 🎯 Scopo: Gestisce interfaccia utente e Shadow DOM
     * 📋 Responsabilità: Creazione Shadow DOM, caricamento template/stili, eventi UI
     */
    const ChatbotUI = {
            /**
     * 📝 Proprietà del modulo
     */
    shadowRoot: null,
    isVisible: false,
    isInitializing: true,

        /**
         * 🎯 Scopo: Inizializza Shadow DOM e carica UI
         * 📥 Input: Container element (HTMLElement)
         * 📤 Output: Shadow DOM completo e funzionante
         * 🔧 Esempio: await ChatbotUI.init(document.body)
         */
        async init(container) {
            try {
                // Determina se siamo in modalità embedded
                this.isEmbedded = ChatbotConfig.current.containerId ? true : false;
                
                await this.createShadowDOM(container);
                await this.loadTemplate();
                
                // Disabilita transizioni durante l'inizializzazione
                const window = this.shadowRoot.querySelector('.chatbot-window');
                if (window) {
                    window.classList.add('chatbot-window--no-transition');
                    
                    // Se embedded, applica stili specifici
                    if (this.isEmbedded) {
                        window.classList.add('chatbot-window--embedded');
                        // In modalità embedded, la finestra è sempre visibile
                        window.classList.add('chatbot-window--visible');
                        window.setAttribute('aria-hidden', 'false');
                        this.isVisible = true;
                    }
                }
                
                await this.loadStyles();
                this.setupEventListeners();
                
                // Inizializza Theme Manager
                ChatbotThemeManager.init(this.shadowRoot);
                
                // Riabilita transizioni dopo un piccolo delay
                setTimeout(() => {
                    if (window) {
                        window.classList.remove('chatbot-window--no-transition');
                    }
                    this.isInitializing = false;
                }, 100);
                
                return true;
                
            } catch (error) {
                console.error('❌ Errore inizializzazione ChatbotUI:', error);
                throw error;
            }
        },

        /**
         * 🎯 Scopo: Crea Shadow DOM isolato
         * 📥 Input: Container element
         * 📤 Output: Shadow DOM creato
         */
        async createShadowDOM(container) {
            try {
                // Crea Shadow DOM con isolamento completo
                this.shadowRoot = container.attachShadow({ mode: 'open' });
                
                // Verifica supporto Shadow DOM
                if (!this.shadowRoot) {
                    throw new Error('Browser non supporta Shadow DOM');
                }
                
            } catch (error) {
                console.error('❌ Errore creazione Shadow DOM:', error);
                throw error;
            }
        },

        /**
         * 🎯 Scopo: Carica template HTML nel Shadow DOM
         * 📥 Input: Nessuno
         * 📤 Output: HTML template caricato
         */
        /**
         * 🎯 Scopo: Carica template HTML hardcoded
         * 📥 Input: Nessuno
         * 📤 Output: Template HTML caricato nel Shadow DOM
         */
        async loadTemplate() {
            const htmlTemplate = `
                ${!this.isEmbedded ? `
                <!-- Pulsante Toggle Chatbot -->
                <button class="chatbot-toggle" aria-label="${ChatbotConfig.t('toggleLabel')}" type="button">
                    <svg class="chatbot-toggle-icon" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                </button>
                ` : ''}

                <!-- Finestra Chatbot -->
                <div class="chatbot-window" aria-hidden="true" role="dialog" aria-labelledby="chatbot-title">
                    <!-- Header -->
                    <header class="chatbot-header">
                        <h2 class="chatbot-title" id="chatbot-title">${ChatbotConfig.t('title')}</h2>
                        <div class="chatbot-header-controls">
                            <!-- Selettore Lingua -->
                            <div class="chatbot-language-selector">
                                <button class="chatbot-language-toggle" aria-label="Seleziona lingua" type="button">
                                    <span class="chatbot-language-current">IT</span>
                                    <svg class="chatbot-language-arrow" viewBox="0 0 24 24">
                                        <path d="M7 10l5 5 5-5z"/>
                                    </svg>
                                </button>
                                <div class="chatbot-language-dropdown" role="menu">
                                    <button class="chatbot-language-option" data-lang="it" role="menuitem">
                                        <span class="chatbot-language-flag">🇮🇹</span>
                                        <span class="chatbot-language-name">Italiano</span>
                                    </button>
                                    <button class="chatbot-language-option" data-lang="en" role="menuitem">
                                        <span class="chatbot-language-flag">🇬🇧</span>
                                        <span class="chatbot-language-name">English</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Selettore Tema -->
                            <div class="chatbot-theme-selector">
                                <button class="chatbot-theme-toggle" aria-label="Seleziona tema" type="button">
                                    <svg class="chatbot-theme-icon" viewBox="0 0 24 24">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="none" stroke="currentColor" stroke-width="2"/>
                                        <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
                                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                                    </svg>
                                    <svg class="chatbot-theme-arrow" viewBox="0 0 24 24">
                                        <path d="M7 10l5 5 5-5z"/>
                                    </svg>
                                </button>
                                <div class="chatbot-theme-dropdown" role="menu">
                                    <button class="chatbot-theme-option" data-theme="classic" role="menuitem">
                                        <span class="chatbot-theme-preview chatbot-theme-preview--classic"></span>
                                        <span class="chatbot-theme-name">Classic</span>
                                    </button>
                                    <button class="chatbot-theme-option" data-theme="dark-wine" role="menuitem">
                                        <span class="chatbot-theme-preview chatbot-theme-preview--dark-wine"></span>
                                        <span class="chatbot-theme-name">Dark-Wine</span>
                                    </button>
                                </div>
                            </div>
                            
                            ${!this.isEmbedded ? `
                            <button class="chatbot-close" aria-label="${ChatbotConfig.t('closeLabel')}" type="button">
                                <svg viewBox="0 0 24 24">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                            ` : ''}
                        </div>
                    </header>

                    <!-- Area Messaggi -->
                    <div class="chatbot-messages" role="log" aria-live="polite" aria-label="Cronologia conversazione">
                        <div class="chatbot-welcome-message chatbot-message chatbot-message--bot">
                            <div class="chatbot-message-content">
                                ${ChatbotConfig.t('welcomeMessage')}
                            </div>
                        </div>
                    </div>

                    <!-- Indicatore Typing -->
                    <div class="chatbot-typing" aria-label="L'assistente sta scrivendo">
                        <div class="chatbot-typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span class="chatbot-typing-text">${ChatbotConfig.t('typing')}</span>
                    </div>

                    <!-- Quick Actions (condizionali) -->
                    ${ChatbotConfig.current.showQuickActions ? `
                    <div class="chatbot-quick-actions">
                        <button class="chatbot-quick-action" data-text="${ChatbotConfig.t('quickAction1')}" data-api-url="https://macaw-eager-gradually.ngrok-free.app/api/winery/experiences">
                            <svg class="chatbot-quick-action-icon" viewBox="0 0 25 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.7759 0.000193492C16.0409 -0.0206865 16.0757 1.65319 16.1992 2.65891C16.7891 7.43695 16.4324 12.2602 16.4167 17.0574C16.6308 17.4942 16.7526 17.9796 16.977 18.4111C18.5987 21.5101 22.3849 21.5188 23.4237 25.3624C24.6295 29.8308 23.8274 37.8208 23.85 42.6841C23.8918 51.5634 23.0983 60.6114 23.3419 69.4662C23.3646 70.3136 23.4707 72.5721 22.8078 73.1237C22.6372 73.2664 22.2736 73.2629 22.0543 73.4143C20.33 74.6062 18.583 75.1438 16.462 75.3039C13.0829 75.558 6.3143 75.6484 3.10226 74.9142C1.80248 74.6166 0.0798789 72.948 0.00505889 71.5664C-0.0784611 70.0282 0.897678 70.0857 1.0508 69.1147C1.19 68.236 0.991639 67.0998 1.06298 66.1689C1.56584 59.5117 1.37618 53.7836 1.23524 47.1994C1.09778 40.8415 0.137298 26.3699 5.42516 21.8094C6.11768 21.2108 7.55666 20.8959 8.09606 20.3043C9.74384 18.4981 9.20618 13.426 9.23402 11.0022C9.26186 8.57839 8.9156 5.81701 9.43586 3.54805C9.98396 1.15033 12.493 0.0384732 14.7759 0.0019332V0.000193492ZM13.5927 6.92191C13.3665 8.23387 12.065 7.59355 11.2803 7.82497C10.4172 8.07901 10.9775 9.35269 10.9914 9.95821C11.0628 13.0711 11.5308 18.9714 9.24794 21.2787C8.21264 22.3244 6.32996 22.6063 5.61482 23.7355C4.37768 25.6913 3.43112 30.2536 3.1562 32.5869C2.44628 38.576 3.30236 44.6573 3.33542 50.6742C3.36326 55.6993 3.2258 60.7158 2.65334 65.6661C2.5037 66.9606 2.09132 69.2452 2.6603 70.3153C3.77216 72.4103 6.07766 72.2833 8.11172 72.3459C10.6243 72.4207 14.5149 72.6139 16.9701 72.3268C18.0315 72.2032 20.3248 71.5507 20.5475 70.3362C20.812 68.8938 20.5092 66.2194 20.5475 64.596C20.5753 63.4545 21.3392 62.0904 19.5574 61.7719C18.0697 61.5057 16.5264 61.3474 15.0265 61.0829C13.9268 60.8898 10.8244 60.6531 10.1284 60.065C9.66032 59.67 8.82512 58.586 8.73986 57.9735C8.4719 56.0856 9.07568 54.0568 9.22706 52.2298C9.58898 47.8972 9.50372 43.6377 9.76994 39.3747C9.82736 38.449 10.4016 34.1912 10.7391 33.5578C12.3086 30.6016 18.684 31.2141 21.4314 30.3301C21.722 28.9033 21.7899 26.6309 21.0834 25.2754C20.4274 24.0139 17.7235 22.5262 16.5507 21.2821C12.8898 17.4037 15.1587 12.9493 14.8229 8.21995L14.3879 1.86895C14.1078 0.722293 11.9867 2.14213 11.5099 2.66065C10.7583 3.47671 10.2989 5.53513 10.9862 6.48865L13.5962 6.92365L13.5927 6.92191ZM12.0685 57.6864C12.7262 58.3528 19.1868 58.5912 20.4692 59.1237C20.6293 59.1376 20.7093 59.0419 20.8155 58.9479C21.7029 58.1493 21.3479 54.0446 21.4158 52.7622C21.7324 46.8132 22.3449 40.276 21.943 34.3269C21.9047 33.7579 21.8334 32.145 21.2974 32.0005L15.371 33.3195C14.7533 33.4952 13.1316 34.0781 12.935 34.7115C12.0946 38.8561 12.7001 43.0078 12.5557 47.2081C12.5017 48.7898 12.4165 50.843 12.3103 52.3933C12.2355 53.5035 11.3081 56.9191 12.0667 57.6882L12.0685 57.6864Z" fill="currentColor"/>
                                <path d="M5.34338 33.3828L5.8532 33.5377C6.12812 34.9245 6.0011 36.3965 6.11246 37.8024C6.42044 41.667 7.37396 47.9118 6.3143 51.5797C6.17684 52.0582 5.83928 52.7316 5.32946 52.8621C4.62476 52.8586 3.85394 50.6019 3.83306 49.9859C3.8 49.0324 4.2959 47.5603 4.36898 46.5024C4.64912 42.483 4.4264 38.3801 4.88924 34.3207C4.931 33.9553 5.00756 33.5847 5.34338 33.3828Z" fill="currentColor"/>
                                <path d="M5.59046 70.429C5.45126 69.2493 5.3399 68.0592 5.4182 66.8655C5.453 66.3279 5.66354 64.5531 5.80274 64.1181C6.0794 63.2516 6.62576 63.697 6.7667 64.4713C6.92504 65.3448 6.4883 69.3955 6.07592 70.1332C5.95064 70.3594 5.88626 70.4882 5.5922 70.4308L5.59046 70.429Z" fill="currentColor"/>
                            </svg>
                            ${ChatbotConfig.t('quickAction1')}
                        </button>
                        <button class="chatbot-quick-action" data-text="${ChatbotConfig.t('quickAction2')}" data-api-url="https://macaw-eager-gradually.ngrok-free.app/api/wine-knowledge/wines">
                            <svg class="chatbot-quick-action-icon" viewBox="0 0 26 75" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_2004_22)">
                                    <path d="M2.84612 69.5801C5.06196 67.8765 9.93949 67.1615 12.5201 65.8682C13.6033 65.3257 14.0244 64.8416 14.0626 63.5729C14.3104 55.1584 13.8645 46.4928 14.2608 38.011C14.3126 36.8858 15.3259 35.0769 13.6528 34.8035C13.1506 34.7205 12.7386 35.0119 12.1891 34.9559C6.78688 34.391 3.28974 26.6422 2.12102 22.092C1.08967 18.0753 1.13921 12.4133 1.87332 8.41897C1.99492 7.75773 1.7945 6.54733 1.40493 5.99368C0.776662 5.10157 -0.914487 4.90208 0.634795 3.15373C2.69975 0.827067 4.7467 1.40537 7.37237 1.1207C8.52982 0.995178 9.62198 0.461705 10.8065 0.280145C14.3194 -0.260052 20.5525 -0.174876 23.4867 1.95005C24.8626 2.94527 24.9279 5.44452 25.0765 7.09201C25.5967 12.8459 26.923 21.6078 24.9662 26.9269C24.205 28.9958 21.773 32.0756 19.8905 33.3061C18.751 34.0503 16.2177 34.1624 15.8957 35.6059C15.4903 37.4148 16.0983 40.6806 16.0826 42.7405C16.0781 43.3794 15.8416 43.9308 15.8371 44.5136C15.7831 51.3142 15.8957 58.1194 15.8461 64.92L16.2042 65.4602L21.0141 67.1727C21.8811 67.6165 25.3084 70.3242 25.6372 71.0863C27.0266 74.3118 20.9016 73.8209 19.3388 73.998C15.416 74.4463 9.72781 75.3295 5.85011 74.8677C3.88423 74.6346 1.19326 73.1597 1.92962 70.7905C1.95213 70.7187 2.78757 69.6249 2.84612 69.5778V69.5801ZM13.9973 1.66538C12.054 1.72142 10.5002 2.12937 8.69196 2.43645C7.46019 2.64491 3.08032 2.71215 3.71534 4.59052C4.16571 5.04105 5.12501 5.56332 5.71274 5.74488C8.15376 6.5025 13.887 6.49129 16.346 5.79643C18.17 5.28089 19.9062 3.96738 21.9352 3.9629L22.1671 3.50116C22.1851 3.29718 22.1536 3.11338 22.0455 2.9363C21.3542 1.81108 15.389 1.62503 13.9973 1.66538ZM22.0905 6.12145C21.3024 6.25594 19.1474 7.61428 18.0912 7.98188C15.1278 9.0152 12.0923 8.92106 8.97794 8.54449C7.42416 8.35621 5.92667 7.94826 4.4562 7.43272C3.10509 8.04016 3.69733 9.66747 3.69282 10.6694C3.6658 16.3986 3.87748 23.3562 7.19222 28.2538C9.08603 31.049 12.8557 33.8643 16.3528 32.033C17.1072 31.6385 17.9674 31.1924 18.7015 30.7845C24.0316 27.8078 23.8312 21.6616 23.7321 16.2731L22.8382 6.17748C22.6062 6.01162 22.3427 6.07886 22.0883 6.12145H22.0905ZM13.5943 67.7219C13.1259 67.7219 12.653 67.6658 12.1868 67.7824C10.8335 68.1186 7.51198 69.477 6.23292 70.1472C5.41099 70.5775 4.31884 70.9451 4.92234 71.9852C5.10249 72.2967 5.69923 72.3954 6.04602 72.4357C9.17836 72.7899 15.2246 72.5702 18.4132 72.1847C18.9492 72.1197 22.1919 71.5481 22.3743 71.4203C23.0003 70.9855 21.7302 70.2637 21.3227 70.0059C20.3814 69.4119 17.0216 67.6927 16.0668 68.2822C15.5286 68.614 15.3732 70.6111 13.9613 70.174C13.3015 69.9701 13.6866 68.2934 13.5943 67.7263V67.7219Z" fill="currentColor"/>
                                    <path d="M15.3352 13.7556C16.6683 13.5583 20.9243 14.3361 21.9241 15.1565C22.5569 15.6765 21.798 16.7793 21.717 17.4159C21.6494 17.9337 21.762 18.4694 21.6967 18.967C21.3341 21.7689 19.9988 29.1546 17.4024 30.607C15.074 31.9093 10.1852 29.0223 9.04347 26.8593C8.64715 26.1061 8.57509 25.0168 8.29585 24.4654C8.0459 23.9723 6.55291 23.45 6.05525 22.661C4.69738 20.5047 5.39095 17.472 7.4379 15.9836C9.48709 14.4908 11.1445 14.6903 13.4211 14.3182C14.0719 14.2128 14.7542 13.843 15.3329 13.7578L15.3352 13.7556Z" fill="currentColor"/>
                                </g>
                                <defs>
                                    <clipPath id="clip0_2004_22">
                                        <rect width="26" height="75" fill="white"/>
                                    </clipPath>
                                </defs>
                            </svg>
                            ${ChatbotConfig.t('quickAction2')}
                        </button>
                    </div>
                    ` : ''}

                    <!-- Area Input -->
                    <div class="chatbot-input-area chatbot-home">
                        <form class="chatbot-input-form">
                            <div class="chatbot-input-container">
                                <input 
                                    type="text" 
                                    class="chatbot-input" 
                                    placeholder="${ChatbotConfig.t('placeholder')}" 
                                    autocomplete="off"
                                    aria-label="${ChatbotConfig.t('placeholder')}"
                                    maxlength="500"
                                />
                                <button 
                                    type="submit" 
                                    class="chatbot-send-button" 
                                    disabled 
                                    aria-label="${ChatbotConfig.t('sendLabel')}"
                                >
                                    <svg viewBox="0 0 24 24">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Footer -->
                    <footer class="chatbot-footer">
                        <div class="chatbot-footer-wave">
                            <svg width="1248" height="64" viewBox="0 0 1248 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 8.5063V64H1248.01V45.0868L1251 8.5063C1251 8.5063 1110.88 45.0868 944.244 45.0868C774.663 45.0868 657.665 -23.4903 421.503 8.50625C151.501 45.0875 62.8255 16.736 0 8.5063Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="chatbot-powered">
                            <span class="chatbot-powered-by">Powered by</span> 
                            <span class="chatbot-name">${ChatbotConfig.t('title')}</span>
                        </div>
                    </footer>
                </div>

                <!-- Template per Messaggi Dinamici -->
                <template class="chatbot-message-template">
                    <div class="chatbot-message">
                        <div class="chatbot-message-content"></div>
                        <div class="chatbot-message-time"></div>
                    </div>
                </template>
            `;
            
            this.shadowRoot.innerHTML = htmlTemplate;
        },

            /**
     * 🎯 Scopo: Carica stili CSS nel Shadow DOM
     * 📥 Input: Nessuno
     * 📤 Output: Stili applicati
     */
    async loadStyles() {
        try {
            // Determina il percorso del CSS basandosi sulla posizione dello script
            const scriptSrc = this.getScriptPath();
            const cssPath = scriptSrc.replace('chatbot.js', 'chatbot.css');
            
            // Usa <link> invece di fetch per evitare problemi CORS con file://
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = cssPath;
            
            // Promessa per sapere quando il CSS è caricato
            const loadPromise = new Promise((resolve, reject) => {
                linkElement.onload = () => {
                    resolve();
                };
                linkElement.onerror = () => {
                    console.error('❌ Errore caricamento CSS file');
                    this.loadFallbackStyles();
                    reject(new Error('CSS file non trovato'));
                };
            });
            
            this.shadowRoot.appendChild(linkElement);
            await loadPromise;
            
        } catch (error) {
            console.error('❌ Errore caricamento stili CSS:', error);
            // Fallback già caricato nell'onerror
        }
    },

        /**
         * 🎯 Scopo: Ottiene il percorso del file script corrente
         * 📥 Input: Nessuno
         * 📤 Output: URL completo del file chatbot.js
         */
        getScriptPath() {
            // Cerca tra tutti i script per trovare quello che contiene chatbot.js
            const scripts = document.querySelectorAll('script[src*="chatbot.js"]');
            if (scripts.length > 0) {
                return scripts[scripts.length - 1].src; // Prende l'ultimo script caricato
            }
            
            // Fallback: cerca nell'elemento script corrente
            const currentScript = document.currentScript;
            if (currentScript && currentScript.src) {
                return currentScript.src;
            }
            
            // Fallback finale: percorso relativo di default
            console.warn('⚠️ Impossibile determinare il percorso dello script, uso fallback');
            return 'chatbot/chatbot.css';
        },

        /**
         * 🎯 Scopo: Ottiene l'URL base del chatbot per percorsi assoluti
         * 📥 Input: Nessuno
         * 📤 Output: URL base del chatbot (es: "https://example.com/chatbot/")
         */
        getBaseURL() {
            const scriptPath = this.getScriptPath();
            
            // Se è un URL completo, estrai la base
            if (scriptPath.startsWith('http')) {
                return scriptPath.replace(/chatbot\.js$/, '');
            }
            
            // Se è un percorso relativo, usa la base del documento corrente
            const baseURL = new URL(scriptPath, document.baseURI);
            return baseURL.href.replace(/chatbot\.js$/, '');
        },

        /**
         * 🎯 Scopo: Genera percorso assoluto per asset (immagini, etc.)
         * 📥 Input: relativePath (string) - percorso relativo dall'asset
         * 📤 Output: URL assoluto dell'asset
         */
        getAssetURL(relativePath) {
            const baseURL = this.getBaseURL();
            return baseURL + relativePath;
        },

        /**
         * 🎯 Scopo: Carica stili CSS di fallback
         * 📥 Input: Nessuno
         * 📤 Output: Stili minimi applicati
         */
        loadFallbackStyles() {
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                :host {
                  --chatbot-primary: #2563eb;
                  --chatbot-spacing-lg: 24px;
                  --chatbot-radius-lg: 12px;
                  --chatbot-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .chatbot-toggle {
                  position: fixed;
                  bottom: var(--chatbot-spacing-lg);
                  right: var(--chatbot-spacing-lg);
                  width: 60px; height: 60px;
                  background: var(--chatbot-primary);
                  border-radius: 50%;
                  cursor: pointer;
                  box-shadow: var(--chatbot-shadow-xl);
                  z-index: 1000;
                }
                .chatbot-window {
                  position: fixed;
                  bottom: 100px; right: var(--chatbot-spacing-lg);
                  width: 500px; height: 800px;
                  background: white;
                  border-radius: var(--chatbot-radius-lg);
                  box-shadow: var(--chatbot-shadow-xl);
                  z-index: 1001;
                  opacity: 0;
                }
                .chatbot-window--visible { opacity: 1; }
            `;
            
            this.shadowRoot.appendChild(styleElement);
        },

        /**
         * 🎯 Scopo: Mostra/nasconde chatbot
         * 📥 Input: Nessuno
         * 📤 Output: Aggiorna stato visibilità
         * 🔧 Esempio: toggle() per cambiare visibilità
         */
        toggle() {
            if (!this.shadowRoot) {
                console.error('❌ Shadow DOM non inizializzato');
                return;
            }

            // Ignora toggle durante l'inizializzazione
            if (this.isInitializing) {
                return;
            }

            const window = this.shadowRoot.querySelector('.chatbot-window');
            const toggle = this.shadowRoot.querySelector('.chatbot-toggle');
            
            if (!window || !toggle) {
                console.error('❌ Elementi UI non trovati');
                return;
            }

            this.isVisible = !this.isVisible;
            
            if (this.isVisible) {
                this.openChatbot(window, toggle);
            } else {
                this.closeChatbot(window, toggle);
            }
        },

        /**
         * 🎯 Scopo: Apre la finestra chatbot
         * 📥 Input: Elementi window e toggle
         * 📤 Output: Finestra aperta con animazione
         */
        openChatbot(window, toggle) {
            // Aggiorna attributi ARIA
            window.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-label', 'Chiudi chat');
            
            // Aggiunge classe per animazione
            window.classList.add('chatbot-window--visible');
            
            // Focus management per accessibilità
            setTimeout(() => {
                const firstInput = window.querySelector('.chatbot-input');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300); // Dopo l'animazione
            
        },

        /**
         * 🎯 Scopo: Chiude la finestra chatbot
         * 📥 Input: Elementi window e toggle
         * 📤 Output: Finestra chiusa con animazione
         */
        closeChatbot(window, toggle) {
            // Controlla se c'è un overlay di degustazione (livello, preview, o chat) e rimuovilo
            const tastingOverlay = this.shadowRoot.querySelector('.chatbot-tasting-overlay');
            if (tastingOverlay) {
                ChatbotTasting.removeOverlay();
                // Reset stato degustazione se era attiva
                if (ChatbotTasting.isActive) {
                    ChatbotTasting.isActive = false;
                    ChatbotTasting.currentTasting = null;
                    ChatbotTasting.currentWineName = null;
                    ChatbotTasting.currentWineId = null;
                    ChatbotTasting.currentWineIndex = null;
                }
            }
            
            // Aggiorna attributi ARIA
            window.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-label', 'Apri chat');
            
            // Rimuove classe per animazione
            window.classList.remove('chatbot-window--visible');
            
            // Non dare focus durante l'inizializzazione
            // toggle.focus();
            
        },

        /**
         * 🎯 Scopo: Imposta event listeners per UI
         * 📥 Input: Nessuno
         * 📤 Output: Eventi collegati
         */
        setupEventListeners() {
            if (!this.shadowRoot) {
                console.error('❌ Shadow DOM non inizializzato per eventi');
                return;
            }

            const toggle = this.shadowRoot.querySelector('.chatbot-toggle');
            const closeButton = this.shadowRoot.querySelector('.chatbot-close');
            const form = this.shadowRoot.querySelector('.chatbot-input-form');
            const input = this.shadowRoot.querySelector('.chatbot-input');
            const sendButton = this.shadowRoot.querySelector('.chatbot-send-button');
            const quickActions = this.shadowRoot.querySelectorAll('.chatbot-quick-action');

            // Event listener per pulsante toggle (solo in modalità floating)
            if (toggle && !this.isEmbedded) {
                toggle.addEventListener('click', () => this.toggle());
                toggle.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggle();
                    }
                });
            }

            // Event listener per pulsante close (solo in modalità floating)
            if (closeButton && !this.isEmbedded) {
                closeButton.addEventListener('click', () => this.toggle());
                closeButton.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggle();
                    }
                });
            }

            // Event listener per form submit
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleMessageSubmit();
                });
            }

            // Event listener per input (abilita/disabilita send button)
            if (input && sendButton) {
                input.addEventListener('input', () => {
                    const hasText = input.value.trim().length > 0;
                    const botNotWaiting = !ChatbotMessages.isWaitingForBotResponse;
                    sendButton.disabled = !(hasText && botNotWaiting);
                });

                // Gestione Enter key
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const hasText = input.value.trim().length > 0;
                        const botNotWaiting = !ChatbotMessages.isWaitingForBotResponse;
                        
                        // Invia solo se c'è testo E il bot non sta rispondendo
                        if (hasText && botNotWaiting) {
                            this.handleMessageSubmit();
                        }
                    }
                });
            }

            // Event listener per click fuori dalla finestra (solo modalità floating)
            if (!this.isEmbedded) {
                document.addEventListener('click', (e) => {
                    if (this.isVisible && !e.composedPath().includes(this.shadowRoot.host)) {
                        // Su mobile, chiudi se clicchi fuori
                        if (window.innerWidth <= 768) {
                            this.toggle();
                        }
                    }
                });

                // Event listener per Escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.isVisible) {
                        this.toggle();
                    }
                });
            }

            // Event listeners per quick actions
            if (quickActions) {
                quickActions.forEach(button => {
                    button.addEventListener('click', () => {
                        const text = button.getAttribute('data-text');
                        const apiUrl = button.getAttribute('data-api-url');
                        
                        if (text && apiUrl) {
                            this.handleQuickAction(text, apiUrl);
                        }
                    });
                });
            }

            // Funzione per chiudere tutte le dropdown
            const closeAllDropdowns = () => {
                const languageDropdown = this.shadowRoot.querySelector('.chatbot-language-dropdown');
                const themeDropdown = this.shadowRoot.querySelector('.chatbot-theme-dropdown');
                
                // Chiudi language dropdown
                if (languageDropdown && languageDropdown.style.display === 'block') {
                    languageDropdown.style.display = 'none';
                    const languageArrow = this.shadowRoot.querySelector('.chatbot-language-arrow');
                    if (languageArrow) {
                        languageArrow.style.transform = 'rotate(0deg)';
                    }
                }
                
                // Chiudi theme dropdown
                if (themeDropdown && themeDropdown.style.display === 'block') {
                    themeDropdown.style.display = 'none';
                    const themeArrow = this.shadowRoot.querySelector('.chatbot-theme-arrow');
                    if (themeArrow) {
                        themeArrow.style.transform = 'rotate(0deg)';
                    }
                }
            };

            // Event listeners per selettore lingua
            const languageToggle = this.shadowRoot.querySelector('.chatbot-language-toggle');
            const languageDropdown = this.shadowRoot.querySelector('.chatbot-language-dropdown');
            const languageOptions = this.shadowRoot.querySelectorAll('.chatbot-language-option');

            // Toggle dropdown
            if (languageToggle && languageDropdown) {
                languageToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isVisible = languageDropdown.style.display === 'block';
                    
                    // Chiudi tutte le dropdown prima di aprire questa
                    closeAllDropdowns();
                    
                    // Se non era visibile, aprila
                    if (!isVisible) {
                        languageDropdown.style.display = 'block';
                        
                        // Toggle arrow rotation
                        const arrow = languageToggle.querySelector('.chatbot-language-arrow');
                        if (arrow) {
                            arrow.style.transform = 'rotate(180deg)';
                            arrow.style.transition = 'transform 0.2s ease';
                        }
                    }
                });

                // Handle language selection
                languageOptions.forEach(option => {
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const newLanguage = option.getAttribute('data-lang');
                        if (newLanguage && ChatbotConfig.setLanguage(newLanguage)) {
                            // Close all dropdowns
                            closeAllDropdowns();
                        }
                    });
                });
            }

            // Event listeners per selettore tema
            const themeToggle = this.shadowRoot.querySelector('.chatbot-theme-toggle');
            const themeDropdown = this.shadowRoot.querySelector('.chatbot-theme-dropdown');
            const themeOptions = this.shadowRoot.querySelectorAll('.chatbot-theme-option');

            // Toggle dropdown tema
            if (themeToggle && themeDropdown) {
                themeToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isVisible = themeDropdown.style.display === 'block';
                    
                    // Chiudi tutte le dropdown prima di aprire questa
                    closeAllDropdowns();
                    
                    // Se non era visibile, aprila
                    if (!isVisible) {
                        themeDropdown.style.display = 'block';
                        
                        // Toggle arrow rotation
                        const arrow = themeToggle.querySelector('.chatbot-theme-arrow');
                        if (arrow) {
                            arrow.style.transform = 'rotate(180deg)';
                            arrow.style.transition = 'transform 0.2s ease';
                        }
                    }
                });

                // Handle theme selection
                themeOptions.forEach(option => {
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const newTheme = option.getAttribute('data-theme');
                        if (newTheme && ChatbotThemeManager.themes[newTheme]) {
                            // Applica tema
                            ChatbotThemeManager.applyTheme(newTheme);
                            
                            // Close all dropdowns
                            closeAllDropdowns();
                        }
                    });
                });
            }

            // Close all dropdowns when clicking outside
            this.shadowRoot.addEventListener('click', () => {
                closeAllDropdowns();
            });
        },

        /**
         * 🎯 Scopo: Gestisce invio messaggio
         * 📥 Input: Nessuno (legge da input field)
         * 📤 Output: Messaggio aggiunto, input resettato
         */
        handleMessageSubmit() {
            const input = this.shadowRoot.querySelector('.chatbot-input');
            const sendButton = this.shadowRoot.querySelector('.chatbot-send-button');
            
            if (!input || !sendButton) {
                console.error('❌ Elementi input non trovati');
                return;
            }

            const message = input.value.trim();
            if (!message) return;

            // Disabilita solo il pulsante send durante il processing
            sendButton.disabled = true;

            // Aggiungi messaggio utente
            ChatbotMessages.addMessage(message, 'user');
            
            // Reset input
            input.value = '';
            
            // Ottieni risposta bot (API o fallback)
            ChatbotMessages.getBotResponse(message);
        },

        /**
         * 🎯 Scopo: Riabilita il pulsante send dopo risposta bot
         * 📥 Input: Nessuno
         * 📤 Output: Pulsante send riabilitato se c'è testo nell'input e bot ha finito
         */
        enableInput() {
            const input = this.shadowRoot.querySelector('.chatbot-input');
            const sendButton = this.shadowRoot.querySelector('.chatbot-send-button');
            
            if (input && sendButton) {
                // Riabilita il pulsante solo se:
                // 1. C'è del testo nell'input
                // 2. Il bot non sta aspettando una risposta
                const hasText = input.value.trim().length > 0;
                const botNotWaiting = !ChatbotMessages.isWaitingForBotResponse;
                sendButton.disabled = !(hasText && botNotWaiting);
                
                // Focus sull'input per continuare la conversazione
                input.focus();
            }
        },

        /**
         * 🎯 Scopo: Gestisce click su quick action
         * 📥 Input: text (string), apiUrl (string)
         * 📤 Output: Messaggio inviato con API custom
         */
        handleQuickAction(text, apiUrl) {
            // Verifica che il bot non stia già rispondendo
            if (ChatbotMessages.isWaitingForBotResponse) {
                return;
            }

            // Disabilita le quick actions durante il processing
            this.disableQuickActions();

            // Aggiungi messaggio utente
            ChatbotMessages.addMessage(text, 'user');
            
            // Ottieni risposta bot usando API custom
            ChatbotMessages.getBotResponseFromCustomAPI(text, apiUrl);
        },

        /**
         * 🎯 Scopo: Disabilita le quick actions durante il processing
         * 📥 Input: Nessuno
         * 📤 Output: Quick actions disabilitate
         */
        disableQuickActions() {
            const quickActions = this.shadowRoot.querySelectorAll('.chatbot-quick-action');
            quickActions.forEach(button => {
                button.disabled = true;
            });
        },

        /**
         * 🎯 Scopo: Riabilita le quick actions dopo la risposta
         * 📥 Input: Nessuno
         * 📤 Output: Quick actions riabilitate
         */
        enableQuickActions() {
            const quickActions = this.shadowRoot.querySelectorAll('.chatbot-quick-action');
            quickActions.forEach(button => {
                button.disabled = false;
            });
        },

        /**
         * 🎯 Scopo: Aggiorna layout per responsive
         * 📥 Input: Nessuno (rileva dimensioni finestra)
         * 📤 Output: Classi CSS aggiornate
         */
        updateResponsiveLayout() {
            if (!this.shadowRoot) return;
            
            const window = this.shadowRoot.querySelector('.chatbot-window');
            if (!window) return;
            
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                window.classList.add('chatbot-window--mobile');
            } else {
                window.classList.remove('chatbot-window--mobile');
            }
        }
    };

    /**
     * 💬 MODULO: ChatbotMessages  
     * 🎯 Scopo: Gestisce sistema di messaggi
     * 📋 Responsabilità: CRUD messaggi, rendering, bot responses
     */
    const ChatbotMessages = {
        /**
         * 📝 Proprietà del modulo
         */
        messages: [],
        isWaitingForBotResponse: false,
        welcomeMessageShown: true,

        /**
         * 🎯 Scopo: Formatta il testo per renderizzazione sicura con link e grassetto
         * 📥 Input: text (string) - testo da formattare
         * 📤 Output: HTML string formattato
         */
        formatMessageText(text) {
            if (!text || typeof text !== 'string') {
                return '';
            }

            // 1. Escapa caratteri HTML per sicurezza
            let formattedText = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

            // 2. Converti **text** in <strong>text</strong>
            formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // 3. PRIMA converti link markdown [text](url) in tag <a>
            const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
            formattedText = formattedText.replace(markdownLinkPattern, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

            // 4. POI converti URL diretti usando approccio word-by-word
            const words = formattedText.split(' ');
            formattedText = words.map(word => {
                // Verifica se la parola è un URL e non è già parte di un tag HTML
                if (word.match(/^https?:\/\/[^\s<>"]+$/) && !word.includes('href=')) {
                    return `<a href="${word}" target="_blank" rel="noopener noreferrer">${word}</a>`;
                }
                return word;
            }).join(' ');

            return formattedText;
        },

        /**
         * 🎯 Scopo: Aggiunge nuovo messaggio alla conversazione
         * 📥 Input: text (string), type ('user'|'bot') 
         * 📤 Output: Messaggio aggiunto e renderizzato
         * 🔧 Esempio: addMessage('Ciao!', 'user')
         */
        addMessage(text, type = 'user') {
            const message = {
                id: Date.now() + Math.random(),
                text: text.trim(),
                type: type,
                timestamp: new Date()
            };

            this.messages.push(message);
            
            // Rimuovi messaggio di benvenuto al primo messaggio utente
            if (type === 'user' && this.welcomeMessageShown) {
                this.removeWelcomeMessage();
                this.welcomeMessageShown = false;
            }
            
            this.render();
        },

        /**
         * 🎯 Scopo: Renderizza tutti i messaggi nell'interfaccia
         * 📥 Input: Nessuno
         * 📤 Output: DOM aggiornato con messaggi
         */
        render() {
            const messagesContainer = ChatbotUI.shadowRoot?.querySelector('.chatbot-messages');
            if (!messagesContainer) {
                console.error('❌ Container messaggi non trovato');
                return;
            }

            // Mantieni messaggio benvenuto se necessario
            const welcomeMsg = messagesContainer.querySelector('.chatbot-welcome-message');
            
            // Rimuovi solo i messaggi dinamici (non il welcome)
            const dynamicMessages = messagesContainer.querySelectorAll('.chatbot-message:not(.chatbot-welcome-message)');
            dynamicMessages.forEach(msg => msg.remove());

            // Renderizza tutti i messaggi
            let hasWineCards = false;
            let hasExperienceCards = false;
            this.messages.forEach(message => {
                const messageElement = this.createMessageElement(message);
                messagesContainer.appendChild(messageElement);
                
                if (message.isWineCards) {
                    hasWineCards = true;
                }
                if (message.isExperienceCards) {
                    hasExperienceCards = true;
                }
            });

            // Configura event listeners per wine cards se presenti
            if (hasWineCards) {
                setTimeout(() => this.setupWineCardListeners(), 100);
            }
            
            // Configura event listeners per experience cards se presenti
            if (hasExperienceCards) {
                setTimeout(() => this.setupExperienceCardListeners(), 100);
            }

            this.scrollToBottom();
        },

        /**
         * 🎯 Scopo: Crea elemento DOM per singolo messaggio
         * 📥 Input: message object {id, text, type, timestamp}
         * 📤 Output: HTMLElement del messaggio
         */
        createMessageElement(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chatbot-message chatbot-message--${message.type}`;
            messageDiv.setAttribute('data-message-id', message.id);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'chatbot-message-content';

            // Gestione speciale per wine cards
            if (message.isWineCards && message.wineCardsHtml) {
                contentDiv.innerHTML = message.wineCardsHtml;
            } 
            // Gestione speciale per experience cards
            else if (message.isExperienceCards && message.experienceCardsHtml) {
                contentDiv.innerHTML = message.experienceCardsHtml;
            } 
            // Gestione speciale per tasting actions
            else if (message.isTastingActions && message.actionsHtml) {
                contentDiv.innerHTML = message.actionsHtml;
            }
            else {
                // Usa formattazione per testo normale con link e grassetto
                contentDiv.innerHTML = this.formatMessageText(message.text);
            }

            const timeDiv = document.createElement('div');
            timeDiv.className = 'chatbot-message-time';
            timeDiv.textContent = this.formatTime(message.timestamp);

            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(timeDiv);

            return messageDiv;
        },

        /**
         * 🎯 Scopo: Formatta timestamp per visualizzazione
         * 📥 Input: Date object
         * 📤 Output: Stringa formattata (HH:MM)
         */
        formatTime(timestamp) {
            return timestamp.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        /**
         * 🎯 Scopo: Scrolla automaticamente all'ultimo messaggio
         * 📥 Input: Nessuno
         * 📤 Output: Scroll aggiornato
         */
        scrollToBottom() {
            const messagesContainer = ChatbotUI.shadowRoot?.querySelector('.chatbot-messages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        },

        /**
         * 🎯 Scopo: Ottiene risposta bot (API o fallback)
         * 📥 Input: userMessage (string) - messaggio dell'utente
         * 📤 Output: Risposta bot dopo delay
         */
        async getBotResponse(userMessage) {
            this.isWaitingForBotResponse = true;
            this.showTypingIndicator();

            try {
                let botResponse;

                if (ChatbotAPI.isConnected()) {
                    // Usa API reale
                    botResponse = await ChatbotAPI.sendMessage(userMessage);
                } else {
                    // Fallback con risposte simulate
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
                    
                    const responses = [
                        "Interessante! Potresti dirmi di più?",
                        "Capisco la tua domanda. Lascia che ci pensi...",
                        "Ottima domanda! Ecco cosa penso:",
                        "Perfetto! Sono qui per aiutarti con questo.",
                        "Vedo il punto. La mia risposta è:",
                        "Grazie per la domanda! La mia opinione:",
                        "Molto bene! Ecco la mia risposta:",
                        "Comprendo! Posso aiutarti così:"
                    ];
                    
                    botResponse = responses[Math.floor(Math.random() * responses.length)];
                }

                this.hideTypingIndicator();
                this.addMessage(botResponse, 'bot');
                
                // Bot ha finito di rispondere
                this.isWaitingForBotResponse = false;
                
                // Riabilita input e quick actions per permettere nuovi messaggi
                ChatbotUI.enableInput();
                ChatbotUI.enableQuickActions();

            } catch (error) {
                console.error('❌ Errore risposta bot:', error);
                this.hideTypingIndicator();
                this.addMessage('Scusa, c\'è stato un problema. Riprova più tardi.', 'bot');
                
                // Bot ha finito di rispondere (anche in caso di errore)
                this.isWaitingForBotResponse = false;
                
                // Riabilita input e quick actions anche in caso di errore
                ChatbotUI.enableInput();
                ChatbotUI.enableQuickActions();
            }
        },

        /**
         * 🎯 Scopo: Ottiene risposta bot da API custom (quick actions)
         * 📥 Input: userMessage (string), customApiUrl (string)
         * 📤 Output: Risposta bot aggiunta ai messaggi
         */
        async getBotResponseFromCustomAPI(userMessage, customApiUrl) {
            this.isWaitingForBotResponse = true;
            this.showTypingIndicator();

            try {
                let botResponse;

                if (ChatbotAPI.isConnected()) {
                    // Usa API custom per quick actions
                    botResponse = await ChatbotAPI.sendMessageToCustomAPI(userMessage, customApiUrl);
                    
                    // Se la risposta contiene vini, gestiscila diversamente
                    if (typeof botResponse === 'object' && botResponse.type === 'wines') {
                        this.hideTypingIndicator();
                        this.addWineCards(botResponse.data);
                        
                        // Bot ha finito di rispondere
                        this.isWaitingForBotResponse = false;
                        
                        // Riabilita input e quick actions
                        ChatbotUI.enableInput();
                        ChatbotUI.enableQuickActions();
                        return;
                    }
                    
                    // Se la risposta contiene esperienze, gestiscila diversamente
                    if (typeof botResponse === 'object' && botResponse.type === 'experiences') {
                        this.hideTypingIndicator();
                        
                        // Prima mostra il messaggio di reply
                        this.addMessage(botResponse.reply, 'bot');
                        
                        // Poi mostra le experience cards
                        this.addExperienceCards(botResponse.data);
                        
                        // Bot ha finito di rispondere
                        this.isWaitingForBotResponse = false;
                        
                        // Riabilita input e quick actions
                        ChatbotUI.enableInput();
                        ChatbotUI.enableQuickActions();
                        return;
                    }
                    
                } else {
                    // Fallback con risposte simulate
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
                    
                    const responses = [
                        "Perfetta domanda! Ecco le informazioni che cerchi:",
                        "Ottimo interesse! Ti racconto tutto:",
                        "Fantastico! Sono felice di rispondere:",
                        "Grande curiosità! Ecco cosa posso dirti:"
                    ];
                    
                    botResponse = responses[Math.floor(Math.random() * responses.length)];
                }

                this.hideTypingIndicator();
                this.addMessage(botResponse, 'bot');
                
                // Bot ha finito di rispondere
                this.isWaitingForBotResponse = false;
                
                // Riabilita input e quick actions
                ChatbotUI.enableInput();
                ChatbotUI.enableQuickActions();

            } catch (error) {
                console.error('❌ Errore risposta bot da API custom:', error);
                this.hideTypingIndicator();
                this.addMessage('Scusa, c\'è stato un problema. Riprova più tardi.', 'bot');
                
                // Bot ha finito di rispondere (anche in caso di errore)
                this.isWaitingForBotResponse = false;
                
                // Riabilita input e quick actions anche in caso di errore
                ChatbotUI.enableInput();
                ChatbotUI.enableQuickActions();
            }
        },

        /**
         * 🎯 Scopo: Mostra indicatore di typing
         * 📥 Input: Nessuno
         * 📤 Output: Indicatore visibile
         */
        showTypingIndicator() {
            const typingIndicator = ChatbotUI.shadowRoot?.querySelector('.chatbot-typing');
            if (typingIndicator) {
                typingIndicator.classList.add('chatbot-typing--visible');
            }
        },

        /**
         * 🎯 Scopo: Nasconde indicatore di typing
         * 📥 Input: Nessuno
         * 📤 Output: Indicatore nascosto
         */
        hideTypingIndicator() {
            const typingIndicator = ChatbotUI.shadowRoot?.querySelector('.chatbot-typing');
            if (typingIndicator) {
                typingIndicator.classList.remove('chatbot-typing--visible');
            }
        },

        /**
         * 🎯 Scopo: Rimuove messaggio di benvenuto
         * 📥 Input: Nessuno
         * 📤 Output: Messaggio benvenuto rimosso
         */
        removeWelcomeMessage() {
            const welcomeMessage = ChatbotUI.shadowRoot?.querySelector('.chatbot-welcome-message');
            if (welcomeMessage) {
                welcomeMessage.remove();
            }
        },

        /**
         * 🎯 Scopo: Aggiunge card dei vini ai messaggi
         * 📥 Input: wines (array di oggetti vino)
         * 📤 Output: Card vini visualizzate
         */
        addWineCards(wines) {
            if (!wines || !Array.isArray(wines) || wines.length === 0) {
                this.addMessage('Non ho trovato vini da mostrare.', 'bot');
                return;
            }

            // Rimuove messaggio di benvenuto se presente
            this.removeWelcomeMessage();

            // Crea container per le wine cards
            const wineCardsHtml = this.createWineCardsHtml(wines);
            
            // Aggiunge ai messaggi con tutte le informazioni necessarie
            const message = {
                id: Date.now() + Math.random(),
                text: `Ecco ${wines.length} vini disponibili:`,
                type: 'bot',
                timestamp: new Date(),
                isWineCards: true,
                wineCardsHtml: wineCardsHtml,
                wines: wines // Salva anche i dati originali per debug
            };

            this.messages.push(message);
            this.render(); // Usa il sistema normale di rendering
        },

        /**
         * 🎯 Scopo: Crea HTML per le wine cards con design moderno
         * 📥 Input: wines (array di oggetti vino)
         * 📤 Output: HTML string delle cards
         */
        createWineCardsHtml(wines) {
            let cardsHtml = '<div class="chatbot-wine-cards">';
            
            wines.forEach((wine, index) => {
                cardsHtml += `
                    <div class="chatbot-wine-card" data-wine-name="${wine.name || ''}" data-wine-id="${wine.id || ''}" data-wine-index="${index}">
                        <img src="https://cdn.pixabay.com/photo/2013/07/12/16/28/wine-150955_1280.png" 
                             alt="Wine bottle" 
                             class="chatbot-wine-image"
                             loading="lazy">
                        <div class="chatbot-wine-name">${wine.name || 'Nome non disponibile'}</div>
                        <div class="chatbot-wine-producer">${wine.producer || 'Produttore sconosciuto'}</div>
                        <div class="chatbot-wine-details">
                            ${wine.vintage ? `<div class="chatbot-wine-chip">
                                <svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_25_32918_${index}_vintage)">
                                        <path d="M5.82107 0H3.05957V4.2726H5.82107V0Z" fill="currentColor"/>
                                        <path d="M8.88076 0H6.11926V4.2726H8.88076V0Z" fill="currentColor"/>
                                        <path d="M12.2385 0V4.2726H15V2.88635C15 1.29237 13.7636 0 12.2385 0Z" fill="currentColor"/>
                                        <path d="M2.7615 0C1.23646 0 0 1.29237 0 2.88635C0 3.65338 0 4.2726 0 4.2726H2.7615V0Z" fill="currentColor"/>
                                        <path d="M11.9403 0H9.17883V4.2726H11.9403V0Z" fill="currentColor"/>
                                        <path d="M11.9403 5.74805H9.17883V13.2486H11.9403V5.74805Z" fill="currentColor"/>
                                        <path d="M8.88076 5.74805H6.11926V13.2486H8.88076V5.74805Z" fill="currentColor"/>
                                        <path d="M5.82107 5.74805H3.05957V13.2486H5.82107V5.74805Z" fill="currentColor"/>
                                        <path d="M2.7615 5.74805H0V13.2486H2.7615V5.74805Z" fill="currentColor"/>
                                        <path d="M15 5.74805H12.2385V13.2486H15V5.74805Z" fill="currentColor"/>
                                        <path d="M8.88076 14.7266H6.11926V18.9992H8.88076V14.7266Z" fill="currentColor"/>
                                        <path d="M5.82107 14.7266H3.05957V18.9992H5.82107V14.7266Z" fill="currentColor"/>
                                        <path d="M2.7615 14.7266H0V16.1128C0 17.7068 1.23646 18.9992 2.7615 18.9992V14.7266Z" fill="currentColor"/>
                                        <path d="M11.9403 14.7266H9.17883V18.9992H11.9403V14.7266Z" fill="currentColor"/>
                                        <path d="M12.2385 14.7266V18.9992C13.7636 18.9992 15 17.7068 15 16.1128V14.7266H12.2385Z" fill="currentColor"/>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_25_32918_${index}_vintage">
                                            <rect width="15" height="19" fill="white"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                                ${wine.vintage}</div>` : ''}
                            ${wine.region ? `<div class="chatbot-wine-chip">
                                <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_25_32914_${index}_region)">
                                        <path d="M12 6.15908C12 9.56124 6 20.0023 6 20.0023C6 20.0023 0 9.56124 0 6.15908C0 2.75692 2.68571 0 6 0C9.31429 0 12 2.75692 12 6.15908Z" fill="currentColor"/>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_25_32914_${index}_region">
                                            <rect width="12" height="20" fill="white"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                                ${wine.region}</div>` : ''}
                            ${wine.type ? `<div class="chatbot-wine-chip">
                                <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_25_32898_${index}_type)">
                                        <path d="M2.90303 5.6883C4.50632 5.6883 5.80605 4.41493 5.80605 2.84415C5.80605 1.27337 4.50632 0 2.90303 0C1.29973 0 0 1.27337 0 2.84415C0 4.41493 1.29973 5.6883 2.90303 5.6883Z" fill="currentColor"/>
                                        <path d="M8.30122 5.6883C9.90452 5.6883 11.2042 4.41493 11.2042 2.84415C11.2042 1.27337 9.90452 0 8.30122 0C6.69792 0 5.39819 1.27337 5.39819 2.84415C5.39819 4.41493 6.69792 5.6883 8.30122 5.6883Z" fill="currentColor"/>
                                        <path d="M13.6988 5.6883C15.3021 5.6883 16.6018 4.41493 16.6018 2.84415C16.6018 1.27337 15.3021 0 13.6988 0C12.0955 0 10.7958 1.27337 10.7958 2.84415C10.7958 4.41493 12.0955 5.6883 13.6988 5.6883Z" fill="currentColor"/>
                                        <path d="M19.097 5.6883C20.7003 5.6883 22 4.41493 22 2.84415C22 1.27337 20.7003 0 19.097 0C17.4937 0 16.194 1.27337 16.194 2.84415C16.194 4.41493 17.4937 5.6883 19.097 5.6883Z" fill="currentColor"/>
                                        <path d="M5.60176 10.5438C7.20505 10.5438 8.50478 9.2704 8.50478 7.69962C8.50478 6.12884 7.20505 4.85547 5.60176 4.85547C3.99846 4.85547 2.69873 6.12884 2.69873 7.69962C2.69873 9.2704 3.99846 10.5438 5.60176 10.5438Z" fill="currentColor"/>
                                        <path d="M11 10.5438C12.6032 10.5438 13.903 9.2704 13.903 7.69962C13.903 6.12884 12.6032 4.85547 11 4.85547C9.39665 4.85547 8.09692 6.12884 8.09692 7.69962C8.09692 9.2704 9.39665 10.5438 11 10.5438Z" fill="currentColor"/>
                                        <path d="M16.3981 10.5438C18.0014 10.5438 19.3012 9.2704 19.3012 7.69962C19.3012 6.12884 18.0014 4.85547 16.3981 4.85547C14.7948 4.85547 13.4951 6.12884 13.4951 7.69962C13.4951 9.2704 14.7948 10.5438 16.3981 10.5438Z" fill="currentColor"/>
                                        <path d="M8.30122 15.5867C9.90452 15.5867 11.2042 14.3134 11.2042 12.7426C11.2042 11.1718 9.90452 9.89844 8.30122 9.89844C6.69792 9.89844 5.39819 11.1718 5.39819 12.7426C5.39819 14.3134 6.69792 15.5867 8.30122 15.5867Z" fill="currentColor"/>
                                        <path d="M13.6988 15.5867C15.3021 15.5867 16.6018 14.3134 16.6018 12.7426C16.6018 11.1718 15.3021 9.89844 13.6988 9.89844C12.0955 9.89844 10.7958 11.1718 10.7958 12.7426C10.7958 14.3134 12.0955 15.5867 13.6988 15.5867Z" fill="currentColor"/>
                                        <path d="M11 20.0008C12.6032 20.0008 13.903 18.7274 13.903 17.1566C13.903 15.5859 12.6032 14.3125 11 14.3125C9.39665 14.3125 8.09692 15.5859 8.09692 17.1566C8.09692 18.7274 9.39665 20.0008 11 20.0008Z" fill="currentColor"/>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_25_32898_${index}_type">
                                            <rect width="22" height="20" fill="white"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                                ${wine.type}</div>` : ''}
                            ${wine.category ? `<div class="chatbot-wine-chip">
                                <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_25_32898_${index}_category)">
                                        <path d="M2.90303 5.6883C4.50632 5.6883 5.80605 4.41493 5.80605 2.84415C5.80605 1.27337 4.50632 0 2.90303 0C1.29973 0 0 1.27337 0 2.84415C0 4.41493 1.29973 5.6883 2.90303 5.6883Z" fill="currentColor"/>
                                        <path d="M8.30122 5.6883C9.90452 5.6883 11.2042 4.41493 11.2042 2.84415C11.2042 1.27337 9.90452 0 8.30122 0C6.69792 0 5.39819 1.27337 5.39819 2.84415C5.39819 4.41493 6.69792 5.6883 8.30122 5.6883Z" fill="currentColor"/>
                                        <path d="M13.6988 5.6883C15.3021 5.6883 16.6018 4.41493 16.6018 2.84415C16.6018 1.27337 15.3021 0 13.6988 0C12.0955 0 10.7958 1.27337 10.7958 2.84415C10.7958 4.41493 12.0955 5.6883 13.6988 5.6883Z" fill="currentColor"/>
                                        <path d="M19.097 5.6883C20.7003 5.6883 22 4.41493 22 2.84415C22 1.27337 20.7003 0 19.097 0C17.4937 0 16.194 1.27337 16.194 2.84415C16.194 4.41493 17.4937 5.6883 19.097 5.6883Z" fill="currentColor"/>
                                        <path d="M5.60176 10.5438C7.20505 10.5438 8.50478 9.2704 8.50478 7.69962C8.50478 6.12884 7.20505 4.85547 5.60176 4.85547C3.99846 4.85547 2.69873 6.12884 2.69873 7.69962C2.69873 9.2704 3.99846 10.5438 5.60176 10.5438Z" fill="currentColor"/>
                                        <path d="M11 10.5438C12.6032 10.5438 13.903 9.2704 13.903 7.69962C13.903 6.12884 12.6032 4.85547 11 4.85547C9.39665 4.85547 8.09692 6.12884 8.09692 7.69962C8.09692 9.2704 9.39665 10.5438 11 10.5438Z" fill="currentColor"/>
                                        <path d="M16.3981 10.5438C18.0014 10.5438 19.3012 9.2704 19.3012 7.69962C19.3012 6.12884 18.0014 4.85547 16.3981 4.85547C14.7948 4.85547 13.4951 6.12884 13.4951 7.69962C13.4951 9.2704 14.7948 10.5438 16.3981 10.5438Z" fill="currentColor"/>
                                        <path d="M8.30122 15.5867C9.90452 15.5867 11.2042 14.3134 11.2042 12.7426C11.2042 11.1718 9.90452 9.89844 8.30122 9.89844C6.69792 9.89844 5.39819 11.1718 5.39819 12.7426C5.39819 14.3134 6.69792 15.5867 8.30122 15.5867Z" fill="currentColor"/>
                                        <path d="M13.6988 15.5867C15.3021 15.5867 16.6018 14.3134 16.6018 12.7426C16.6018 11.1718 15.3021 9.89844 13.6988 9.89844C12.0955 9.89844 10.7958 11.1718 10.7958 12.7426C10.7958 14.3134 12.0955 15.5867 13.6988 15.5867Z" fill="currentColor"/>
                                        <path d="M11 20.0008C12.6032 20.0008 13.903 18.7274 13.903 17.1566C13.903 15.5859 12.6032 14.3125 11 14.3125C9.39665 14.3125 8.09692 15.5859 8.09692 17.1566C8.09692 18.7274 9.39665 20.0008 11 20.0008Z" fill="currentColor"/>
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_25_32898_${index}_category">
                                            <rect width="22" height="20" fill="white"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                                ${wine.category}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            cardsHtml += '</div>';
            return cardsHtml;
        },

        /**
         * 🎯 Scopo: Configura event listeners per wine cards dopo il render
         * 📥 Input: Nessuno
         * 📤 Output: Event listeners configurati
         */
        setupWineCardListeners() {
            const wineCards = ChatbotUI.shadowRoot.querySelectorAll('.chatbot-wine-card');
            wineCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const wineName = card.getAttribute('data-wine-name');
                    const wineId = card.getAttribute('data-wine-id');
                    const wineIndex = card.getAttribute('data-wine-index');
                    
                    if (wineName && wineId) {
                        ChatbotTasting.startTasting(wineName, wineIndex, wineId);
                    }
                });
            });
        },

        /**
         * 🎯 Scopo: Configura event listeners per experience cards dopo il render
         * 📥 Input: Nessuno
         * 📤 Output: Event listeners configurati
         */
        setupExperienceCardListeners() {
            const experienceCards = ChatbotUI.shadowRoot.querySelectorAll('.chatbot-experience-card');
            experienceCards.forEach((card) => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const experienceIndex = parseInt(card.getAttribute('data-experience-index'));
                    if (!isNaN(experienceIndex) && experienceIndex >= 0) {
                        this.showExperienceOverlay(experienceIndex);
                    }
                });
            });
        },

        /**
         * 🎯 Scopo: Mostra overlay con dettagli dell'esperienza
         * 📥 Input: experienceIndex (number)
         * 📤 Output: Overlay mostrato
         */
        showExperienceOverlay(experienceIndex) {
            // Trova l'ultimo messaggio con experience cards (il più recente)
            const experienceMessage = this.messages.slice().reverse().find(msg => msg.isExperienceCards);
            if (!experienceMessage || !experienceMessage.experiences[experienceIndex]) {
                console.error('❌ Esperienza non trovata:', experienceIndex);
                return;
            }

            const experience = experienceMessage.experiences[experienceIndex];
            experience.index = experienceIndex; // Aggiungi l'indice per riferimento futuro
            ChatbotExperience.showOverlay(experience);
        },

        /**
         * 🎯 Scopo: Aggiunge card delle esperienze ai messaggi
         * 📥 Input: experiences (array di oggetti esperienza)
         * 📤 Output: Card esperienze visualizzate
         */
        addExperienceCards(experiences) {
            if (!experiences || !Array.isArray(experiences) || experiences.length === 0) {
                this.addMessage('Non ho trovato esperienze da mostrare.', 'bot');
                return;
            }

            // Crea container per le experience cards
            const experienceCardsHtml = this.createExperienceCardsHtml(experiences);
            
            // Aggiunge ai messaggi con tutte le informazioni necessarie
            const message = {
                id: Date.now() + Math.random(),
                text: '', // Nessun testo, solo cards
                type: 'bot',
                timestamp: new Date(),
                isExperienceCards: true,
                experienceCardsHtml: experienceCardsHtml,
                experiences: experiences // Salva anche i dati originali per debug
            };

            this.messages.push(message);
            this.render(); // Usa il sistema normale di rendering
        },

        /**
         * 🎯 Scopo: Crea HTML per le experience cards
         * 📥 Input: experiences (array di oggetti esperienza)
         * 📤 Output: HTML string delle cards
         */
        createExperienceCardsHtml(experiences) {
            let cardsHtml = '<div class="chatbot-experience-cards">';
            
            experiences.forEach((experience, index) => {
                const backgroundImage = experience.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400';
                
                cardsHtml += `
                    <div class="chatbot-experience-card" 
                         data-experience-index="${index}" 
                         data-experience-id="${experience.id || ''}"
                         style="background-image: url('${backgroundImage}')">
                        <div class="chatbot-experience-overlay">
                            <div class="chatbot-experience-content">
                                <div class="chatbot-experience-container">
                                    <div class="chatbot-experience-left">
                                        <div class="chatbot-experience-title">${experience.title || 'Esperienza non disponibile'}</div>
                                    </div>
                                    <div class="chatbot-experience-right">
                                        <div class="chatbot-experience-included-label">${ChatbotConfig.t('included')}</div>
                                        <div class="chatbot-experience-description">${experience.description || ''}</div>
                                        <div class="chatbot-experience-chips">
                                            ${experience.duration ? `<div class="chatbot-experience-chip">${experience.duration}</div>` : ''}
                                            ${experience.price ? `<div class="chatbot-experience-chip">${experience.price}</div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            cardsHtml += '</div>';
            return cardsHtml;
        },

 
    };

    /**
     * 🌐 MODULO: ChatbotAPI
     * 🎯 Scopo: Gestisce integrazione API esterna
     * 📋 Responsabilità: Autenticazione, chiamate API, error handling
     */
    const ChatbotAPI = {
        /**
         * 📝 Proprietà del modulo
         */
        token: null,
        baseURL: 'https://macaw-eager-gradually.ngrok-free.app',
        isAuthenticated: false,
        userGUID: null,
        clientId: '89b90056-4cc4-054a-a3db-9a3c0ded7efc', // Default, sarà configurabile

        /**
         * 🎯 Scopo: Genera GUID unico per l'utente
         * 📥 Input: Nessuno
         * 📤 Output: GUID stringa
         */
        generateUserGUID() {
            return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        /**
         * 🎯 Scopo: Inizializza API con GUID utente
         * 📥 Input: clientId (string, opzionale)
         * 📤 Output: API inizializzato
         */
        init(clientId = null) {
            if (clientId) {
                this.clientId = clientId;
            }
            
            this.userGUID = this.generateUserGUID();
        },

        /**
         * 🎯 Scopo: Autentica con l'API e ottiene token
         * 📥 Input: Nessuno (usa clientId fisso)
         * 📤 Output: Token di autenticazione salvato
         */
        async authenticate() {
            try {
                
                const response = await fetch(`${this.baseURL}/auth/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({
                        clientId: 'discord'
                    })
                });

                if (!response.ok) {
                    throw new Error(`Errore HTTP: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.token) {
                    this.token = data.token;
                    this.isAuthenticated = true;
                    return true;
                } else {
                    throw new Error('Token non ricevuto nella risposta');
                }

            } catch (error) {
                console.error('❌ Errore autenticazione:', error);
                this.isAuthenticated = false;
                this.token = null;
                throw error;
            }
        },

        /**
         * 🎯 Scopo: Invia messaggio all'API e ottiene risposta bot
         * 📥 Input: message (string)
         * 📤 Output: Risposta del bot
         */
        async sendMessage(message) {
            try {
                if (!this.isAuthenticated || !this.token) {
                    throw new Error('Non autenticato - richiesto login');
                }

                if (!this.userGUID) {
                    throw new Error('GUID utente non generato');
                }

                const response = await fetch(`${this.baseURL}/${this.clientId}/message`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`,
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({
                        text: message,
                        user: this.userGUID,
                        client: this.clientId,
                        language: ChatbotConfig.current.language || 'it'
                    })
                });

                if (!response.ok) {
                    throw new Error(`Errore HTTP: ${response.status}`);
                }

                const data = await response.json();
                
                // La risposta è un array di oggetti con struttura: [{user, text, action}]
                if (Array.isArray(data) && data.length > 0) {
                    // Prende il campo 'text' del primo elemento
                    const firstMessage = data[0];
                    if (firstMessage && firstMessage.text) {
                        return firstMessage.text;
                    }
                }
                
                // Fallback se la struttura non è quella attesa
                return data.response || data.text || 'Scusa, non sono riuscito a elaborare la tua richiesta.';

            } catch (error) {
                console.error('❌ Errore invio messaggio:', error);
                // Fallback con risposta locale
                return 'Scusa, c\'è stato un problema di connessione. Riprova più tardi.';
            }
        },

        /**
         * 🎯 Scopo: Invia messaggio a API custom (quick actions)
         * 📥 Input: message (string), customApiUrl (string)
         * 📤 Output: Risposta dell'API custom
         */
        async sendMessageToCustomAPI(message, customApiUrl) {
            try {
                if (!this.isAuthenticated || !this.token) {
                    throw new Error('Non autenticato - richiesto login');
                }

                const response = await fetch(customApiUrl, {
                    method: 'GET', // Assumendo GET per le API specifiche
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Errore HTTP: ${response.status}`);
                }

                const data = await response.json();
                
                // Gestione speciale per API wine-knowledge/wines
                if (customApiUrl.includes('wine-knowledge/wines') && data.wines && Array.isArray(data.wines)) {
                    return { type: 'wines', data: data.wines };
                }
                
                // Gestione speciale per API experiences
                if (customApiUrl.includes('api/winery/experiences') && data.reply && data.cards && Array.isArray(data.cards)) {
                    return { type: 'experiences', reply: data.reply, data: data.cards };
                }
                
                
                // Se la risposta è un array, prende il primo elemento
                if (Array.isArray(data) && data.length > 0) {
                    const firstMessage = data[0];
                    if (firstMessage && firstMessage.text) {
                        return firstMessage.text;
                    }
                }
                
                // Se è un oggetto diretto
                if (data && data.text) {
                    return data.text;
                }
                
                // Se è una stringa diretta
                if (typeof data === 'string') {
                    return data;
                }
                
                // Fallback
                return data.response || data.message || 'Scusa, non sono riuscito a elaborare la tua richiesta.';

            } catch (error) {
                console.error('❌ Errore invio a API custom:', error);
                throw error;
            }
        },

        /**
         * 🎯 Scopo: Verifica stato connessione API
         * 📥 Input: Nessuno
         * 📤 Output: boolean stato connessione
         */
        isConnected() {
            return this.isAuthenticated && this.token !== null;
        },

        /**
         * 🎯 Scopo: Reset autenticazione
         * 📥 Input: Nessuno
         * 📤 Output: Stato resettato
         */
        reset() {
            this.token = null;
            this.isAuthenticated = false;
            this.userGUID = null;
        }
    };

    /**
    /**
     * 🍷 MODULO: ChatbotTasting
     * 🎯 Scopo: Gestisce il flusso di degustazione vino
     * 📋 Responsabilità: Overlay selezione livello, API tasting, gestione stages
     */
    const ChatbotTasting = {
        /**
         * 📝 Proprietà del modulo
         */
        currentTasting: null,
        currentWineName: null,
        currentWineId: null,
        currentWineIndex: null,
        isActive: false,

        /**
         * 🎯 Scopo: Avvia flusso di degustazione vino
         * 📥 Input: wineName (string), wineIndex (number), wineId (string)
         * 📤 Output: Overlay selezione livello visualizzato
         */
        startTasting(wineName, wineIndex, wineId) {
            this.currentWineName = wineName;
            this.currentWineId = wineId;
            this.currentWineIndex = wineIndex;
            this.showLevelSelector();
        },

        /**
         * 🎯 Scopo: Mostra overlay per selezione livello (principiante/esperto)
         * 📥 Input: Nessuno
         * 📤 Output: Overlay visualizzato
         */
        showLevelSelector() {
            this.createOverlay('level-selector', `
                <div class="chatbot-tasting-overlay-content">
                    <h2 class="chatbot-tasting-title">${ChatbotConfig.t('selectLevel')}</h2>
                    <div class="chatbot-level-cards">
                        <div class="chatbot-level-card" data-level="beginner">
                            <div class="chatbot-level-icon">
                                <img src="${ChatbotUI.getAssetURL('assets/imgs/wine-levels/beginner.svg')}" alt="Beginner" class="chatbot-level-image">
                            </div>
                            <h3 class="chatbot-level-name">${ChatbotConfig.t('beginner')}</h3>
                            <p class="chatbot-level-description">${ChatbotConfig.t('beginnerDesc')}</p>
                        </div>
                        <div class="chatbot-level-card" data-level="expert">
                            <div class="chatbot-level-icon">
                                <img src="${ChatbotUI.getAssetURL('assets/imgs/wine-levels/expert.svg')}" alt="Expert" class="chatbot-level-image">
                            </div>
                            <h3 class="chatbot-level-name">${ChatbotConfig.t('expert')}</h3>
                            <p class="chatbot-level-description">${ChatbotConfig.t('expertDesc')}</p>
                        </div>
                    </div>
                </div>
            `);

            // Setup event listeners per selezione livello
            const levelCards = ChatbotUI.shadowRoot.querySelectorAll('.chatbot-level-card');
            levelCards.forEach(card => {
                card.addEventListener('click', () => {
                    const level = card.getAttribute('data-level');
                    this.selectLevel(level);
                });
            });
        },

        /**
         * 🎯 Scopo: Gestisce selezione livello e chiamata API
         * 📥 Input: level (string) - 'beginner' o 'expert'
         * 📤 Output: Chiamata API e passaggio al prossimo step
         */
        async selectLevel(level) {
            try {
                this.removeOverlay();
                this.showLoadingOverlay();

                // Chiamata API tasting
                const tastingData = await this.callTastingAPI(level);
                
                this.removeOverlay();
                this.currentTasting = tastingData;
                this.showStagePreview();

            } catch (error) {
                console.error('❌ Errore selezione livello:', error);
                this.removeOverlay();
                this.showErrorOverlay('Errore durante l\'avvio della degustazione. Riprova.');
            }
        },

        /**
         * 🎯 Scopo: Chiama API per iniziare degustazione
         * 📥 Input: level (string), stage (string, opzionale)
         * 📤 Output: Dati degustazione dalla API
         */
        async callTastingAPI(level, stage = 'visual') {
            if (!ChatbotAPI.isAuthenticated) {
                throw new Error('API non autenticata');
            }

            const payload = {
                language: ChatbotConfig.current.language || 'it',
                mode: level, // 'beginner' o 'expert'
                userId: ChatbotAPI.userGUID,
                wineName: this.currentWineId,
                stage: stage
            };

            const response = await fetch(`${ChatbotAPI.baseURL}/api/wine-tasting`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ChatbotAPI.token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Errore API: ${response.status}`);
            }

            return await response.json();
        },

        /**
         * 🎯 Scopo: Mostra overlay con anteprima stage corrente
         * 📥 Input: Nessuno
         * 📤 Output: Overlay stage preview visualizzato
         */
        showStagePreview() {
            if (!this.currentTasting) return;

            const { currentStage, previewText } = this.currentTasting;

            this.createOverlay('stage-preview', `
                <div class="chatbot-tasting-overlay-content">
                    <div class="chatbot-stage-preview-header">
                        <div class="chatbot-stage-icon">
                            <img src="${ChatbotUI.getAssetURL(`assets/imgs/wine-stages/${currentStage}.svg`)}" alt="${currentStage}" class="chatbot-stage-image">
                        </div>
                        <h2 class="chatbot-stage-title">${ChatbotConfig.t('stage')} ${currentStage}</h2>
                    </div>
                    <p class="chatbot-stage-description">${previewText || 'Iniziamo questa fase della degustazione.'}</p>
                    <div class="chatbot-stage-actions">
                        <button class="chatbot-stage-button chatbot-stage-start" data-action="start">
                            ${ChatbotConfig.t('start')}
                        </button>
                    </div>
                </div>
            `);

            // Setup event listener per bottone start
            const startButton = ChatbotUI.shadowRoot.querySelector('.chatbot-stage-start');
            if (startButton) {
                startButton.addEventListener('click', () => {
                    this.startStage();
                });
            }
        },

        /**
         * 🎯 Scopo: Avvia stage di degustazione
         * 📥 Input: Nessuno
         * 📤 Output: Overlay rimosso, chat di degustazione mostrata
         */
        startStage() {
            this.removeOverlay();
            this.isActive = true;
            this.showTastingChat();
        },

        /**
         * 🎯 Scopo: Mostra overlay chat dedicato per la degustazione
         * 📥 Input: Nessuno
         * 📤 Output: Chat di degustazione visualizzata
         */
        showTastingChat() {
            if (!this.currentTasting) return;

            const { currentStage } = this.currentTasting;

            this.createOverlay('tasting-chat', `
                <div class="chatbot-tasting-chat-container">
                    <div class="chatbot-tasting-chat-header">
                        <h3 class="chatbot-tasting-chat-title">${ChatbotConfig.t('stage')}: ${currentStage}</h3>
                        <button class="chatbot-tasting-chat-close" id="tasting-close-button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="chatbot-tasting-messages" id="tasting-messages"></div>
                    
                    <!-- Typing indicator - IDENTICO alla chat principale -->
                    <div class="chatbot-typing" id="tasting-typing-indicator" style="display: none;">
                        <div class="chatbot-typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div class="chatbot-typing-text">${ChatbotConfig.t('typing')}</div>
                    </div>
                    
                    <!-- Area azioni degustazione -->
                    <div class="chatbot-tasting-actions" id="tasting-actions-area" style="display: none;">
                        <!-- Il bottone continua sarà aggiunto qui dinamicamente -->
                    </div>
                    
                    <!-- Area input - IDENTICA alla chat principale -->
                    <div class="chatbot-input-area" id="tasting-input-area" style="display: none;">
                        <form class="chatbot-input-form" id="tasting-input-form">
                            <div class="chatbot-input-container">
                                <input 
                                    type="text" 
                                    class="chatbot-input" 
                                    id="tasting-input"
                                    placeholder="${ChatbotConfig.t('placeholder')}" 
                                    autocomplete="off"
                                >
                                <button 
                                    type="submit" 
                                    class="chatbot-send-button" 
                                    id="tasting-send-button"
                                    aria-label="${ChatbotConfig.t('sendLabel')}"
                                    disabled
                                >
                                    <svg viewBox="0 0 24 24">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `);

            // Avvia i messaggi dopo un breve delay
            setTimeout(() => {
                // Setup event listeners dopo che l'HTML è renderizzato
                this.setupTastingInputListeners();
                this.showStageMessages();
            }, 300);
        },

        /**
         * 🎯 Scopo: Mostra messaggi dello stage automaticamente nella chat di degustazione
         * 📥 Input: Nessuno
         * 📤 Output: Messaggi mostrati con delay nella chat dedicata
         */
        async showStageMessages() {
            if (!this.currentTasting || !this.currentTasting.chunks) return;

            const chunks = this.currentTasting.chunks;
            const messagesContainer = ChatbotUI.shadowRoot.querySelector('#tasting-messages');
            
            if (!messagesContainer) {
                console.error('❌ Container messaggi degustazione non trovato');
                return;
            }

            // Mostra ogni chunk con delay ottimizzato
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                
                // Delay prima di ogni messaggio (bilanciato)
                await new Promise(resolve => setTimeout(resolve, i === 0 ? 400 : 1200));
                
                // Mostra typing indicator
                this.showTastingTyping(messagesContainer);
                
                // Delay per il typing (bilanciato)
                await new Promise(resolve => setTimeout(resolve, 900));
                
                // Nascondi typing e mostra messaggio
                this.hideTastingTyping(messagesContainer);
                this.addTastingMessage(messagesContainer, chunk.text);
            }

            // Mostra input per permettere interazione (bilanciato)
            await new Promise(resolve => setTimeout(resolve, 700));
            this.showTastingInput();
            
            // Mostra bottone continua nel footer dopo tutti i messaggi
            this.showTastingContinueButton();
        },

        /**
         * 🎯 Scopo: Aggiunge messaggio alla chat di degustazione (STESSO STILE CHAT PRINCIPALE)
         * 📥 Input: container, text
         * 📤 Output: Messaggio aggiunto
         */
        addTastingMessage(container, text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chatbot-message chatbot-message--bot';
            messageDiv.setAttribute('data-message-id', Date.now() + Math.random());

            const contentDiv = document.createElement('div');
            contentDiv.className = 'chatbot-message-content';
            // Usa formattazione per link e grassetto
            contentDiv.innerHTML = ChatbotMessages.formatMessageText(text);

            const timeDiv = document.createElement('div');
            timeDiv.className = 'chatbot-message-time';
            timeDiv.textContent = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(timeDiv);
            
            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight;
        },

        /**
         * 🎯 Scopo: Mostra typing indicator nella chat di degustazione (FISSO IN BASSO)
         * 📥 Input: container
         * 📤 Output: Typing indicator mostrato
         */
        showTastingTyping(container) {
            const typingIndicator = ChatbotUI.shadowRoot.querySelector('#tasting-typing-indicator');
            if (typingIndicator) {
                typingIndicator.style.display = 'flex';
            }
        },

        /**
         * 🎯 Scopo: Nasconde typing indicator nella chat di degustazione
         * 📥 Input: container
         * 📤 Output: Typing indicator nascosto
         */
        hideTastingTyping(container) {
            const typingIndicator = ChatbotUI.shadowRoot.querySelector('#tasting-typing-indicator');
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
        },

        /**
         * 🎯 Scopo: Mostra bottone continua nell'area azioni footer
         * 📥 Input: Nessuno
         * 📤 Output: Bottone aggiunto nel footer
         */
        showTastingContinueButton() {
            const actionsArea = ChatbotUI.shadowRoot.querySelector('#tasting-actions-area');
            if (!actionsArea) {
                console.error('❌ Area azioni degustazione non trovata');
                return;
            }

            // Se il nextStage è "feedback", considera la degustazione come terminata
            const hasNextStage = this.currentTasting.nextStage && this.currentTasting.nextStage !== 'feedback';
            const buttonText = hasNextStage ? ChatbotConfig.t('continue') : ChatbotConfig.t('endTasting');
            
            // Pulisci area azioni precedenti
            actionsArea.innerHTML = '';
            
            // Crea il bottone senza icona
            actionsArea.innerHTML = `
                <button 
                    class="chatbot-continue-button" 
                    data-action="${hasNextStage ? 'continue' : 'end'}"
                    aria-label="${buttonText}"
                    title="${buttonText}"
                >
                    ${buttonText}
                </button>
            `;

            // Mostra l'area azioni
            actionsArea.style.display = 'flex';

            // Setup event listener per bottone
            const continueButton = actionsArea.querySelector('.chatbot-continue-button');
            if (continueButton) {
                continueButton.addEventListener('click', () => {
                    const action = continueButton.getAttribute('data-action');
                    if (action === 'continue') {
                        this.continueToNextStage();
                    } else {
                        this.endTasting();
                    }
                });
            }
        },

        /**
         * 🎯 Scopo: Mostra input area per interazione utente
         * 📥 Input: Nessuno
         * 📤 Output: Input area visibile
         */
        showTastingInput() {
            const inputArea = ChatbotUI.shadowRoot.querySelector('#tasting-input-area');
            if (inputArea) {
                inputArea.style.display = 'block';
            }
        },

        /**
         * 🎯 Scopo: Setup event listeners per input di degustazione
         * 📥 Input: Nessuno
         * 📤 Output: Event listeners configurati
         */
        setupTastingInputListeners() {
            const form = ChatbotUI.shadowRoot.querySelector('#tasting-input-form');
            const input = ChatbotUI.shadowRoot.querySelector('#tasting-input');
            const sendButton = ChatbotUI.shadowRoot.querySelector('#tasting-send-button');
            const closeButton = ChatbotUI.shadowRoot.querySelector('#tasting-close-button');

            // Close button
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.endTasting();
                });
            } else {
                console.error('❌ Bottone close non trovato!');
            }

            if (form && input && sendButton) {
                // Form submit
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleTastingMessageSubmit();
                });

                // Input events
                input.addEventListener('input', () => {
                    sendButton.disabled = input.value.trim().length === 0;
                });

                // Enter key
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (input.value.trim().length > 0) {
                            this.handleTastingMessageSubmit();
                        }
                    }
                });
            }
        },

        /**
         * 🎯 Scopo: Gestisce invio messaggio nella chat di degustazione
         * 📥 Input: Nessuno
         * 📤 Output: Messaggio inviato e risposta API
         */
        async handleTastingMessageSubmit() {
            const input = ChatbotUI.shadowRoot.querySelector('#tasting-input');
            const sendButton = ChatbotUI.shadowRoot.querySelector('#tasting-send-button');
            const messagesContainer = ChatbotUI.shadowRoot.querySelector('#tasting-messages');

            if (!input || !sendButton || !messagesContainer) return;

            const message = input.value.trim();
            if (!message) return;

            // Disabilita input durante invio
            sendButton.disabled = true;
            input.disabled = true;

            // Aggiungi messaggio utente
            this.addTastingUserMessage(messagesContainer, message);
            
            // Reset input
            input.value = '';

            try {
                // Mostra typing indicator
                this.showTastingTyping();
                
                // Chiamata API feedback
                const response = await this.callFeedbackAPI(message);
                
                // Nasconde typing indicator
                this.hideTastingTyping();
                
                // Mostra risposta bot (se presente)
                if (response && response.responseToFeedback) {
                    this.addTastingMessage(messagesContainer, response.responseToFeedback);
                }
                
            } catch (error) {
                console.error('❌ Errore invio feedback:', error);
                this.hideTastingTyping();
                this.addTastingMessage(messagesContainer, 'Scusa, c\'è stato un problema. Riprova più tardi.');
            } finally {
                // Riabilita input
                input.disabled = false;
                input.focus();
            }
        },

        /**
         * 🎯 Scopo: Aggiunge messaggio utente alla chat di degustazione
         * 📥 Input: container, text
         * 📤 Output: Messaggio utente aggiunto
         */
        addTastingUserMessage(container, text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chatbot-message chatbot-message--user';
            messageDiv.setAttribute('data-message-id', Date.now() + Math.random());

            const contentDiv = document.createElement('div');
            contentDiv.className = 'chatbot-message-content';
            // Usa formattazione per link e grassetto
            contentDiv.innerHTML = ChatbotMessages.formatMessageText(text);

            const timeDiv = document.createElement('div');
            timeDiv.className = 'chatbot-message-time';
            timeDiv.textContent = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(timeDiv);
            
            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight;
        },

        /**
         * 🎯 Scopo: Chiama API feedback per messaggio utente
         * 📥 Input: feedbackText (string)
         * 📤 Output: Risposta API
         */
        async callFeedbackAPI(feedbackText) {
            if (!ChatbotAPI.isAuthenticated || !this.currentTasting) {
                throw new Error('API non autenticata o degustazione non attiva');
            }

            const payload = {
                sessionId: ChatbotAPI.userGUID,
                wineName: this.currentWineId,
                stage: this.currentTasting.currentStage,
                feedbackType: "stage",
                feedbackText: feedbackText
            };

            const response = await fetch(`${ChatbotAPI.baseURL}/api/wine-tasting/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ChatbotAPI.token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Errore API feedback: ${response.status}`);
            }

            return await response.json();
        },

        /**
         * 🎯 Scopo: Continua al prossimo stage
         * 📥 Input: Nessuno
         * 📤 Output: Chiamata API per prossimo stage o termina se feedback
         */
        async continueToNextStage() {
            // Se non c'è nextStage o è "feedback", termina la degustazione
            if (!this.currentTasting.nextStage || this.currentTasting.nextStage === 'feedback') {
                this.endTasting();
                return;
            }

            try {
                // Nascondi l'area azioni prima di procedere
                const actionsArea = ChatbotUI.shadowRoot.querySelector('#tasting-actions-area');
                if (actionsArea) {
                    actionsArea.style.display = 'none';
                }

                // Rimuovi overlay chat corrente e mostra loading
                this.removeOverlay();
                this.showLoadingOverlay();

                // Chiamata API per prossimo stage
                const nextStageData = await this.callTastingAPI(this.currentTasting.mode || 'beginner', this.currentTasting.nextStage);
                
                this.removeOverlay();
                this.currentTasting = nextStageData;
                this.showStagePreview();

            } catch (error) {
                console.error('❌ Errore prossimo stage:', error);
                this.removeOverlay();
                this.showErrorOverlay('Errore durante il caricamento del prossimo stage.');
            }
        },

        /**
         * 🎯 Scopo: Termina degustazione
         * 📥 Input: Nessuno
         * 📤 Output: Overlay chiuso, ritorno al chatbot normale
         */
        endTasting() {
            // Nascondi l'area azioni se presente
            const actionsArea = ChatbotUI.shadowRoot.querySelector('#tasting-actions-area');
            if (actionsArea) {
                actionsArea.style.display = 'none';
            }
            
            // Rimuovi overlay prima di tutto
            this.removeOverlay();
            
            // Reset stato degustazione
            this.isActive = false;
            this.currentTasting = null;
            this.currentWineName = null;
            this.currentWineId = null;
            this.currentWineIndex = null;
            
            // Mostra messaggio di fine degustazione
            ChatbotMessages.addMessage(ChatbotConfig.t('tastingCompleted'), 'bot');
            
            // Ripristina chatbot normale
            ChatbotConfig.updateWelcomeMessage();
        },

        /**
         * 🎯 Scopo: Crea overlay generico
         * 📥 Input: type (string), content (string)
         * 📤 Output: Overlay visualizzato
         */
        createOverlay(type, content) {
            this.removeOverlay(); // Rimuovi overlay precedenti

            const overlay = document.createElement('div');
            overlay.className = `chatbot-tasting-overlay chatbot-tasting-overlay--${type}`;
            overlay.innerHTML = content;

            // Se siamo in modalità embedded, appendi alla finestra chatbot
            // altrimenti appendi al shadowRoot per il posizionamento fixed
            if (ChatbotUI.isEmbedded) {
                const chatbotWindow = ChatbotUI.shadowRoot.querySelector('.chatbot-window');
                if (chatbotWindow) {
                    chatbotWindow.appendChild(overlay);
                } else {
                    ChatbotUI.shadowRoot.appendChild(overlay);
                }
            } else {
                ChatbotUI.shadowRoot.appendChild(overlay);
            }
        },

        /**
         * 🎯 Scopo: Mostra overlay di caricamento
         * 📥 Input: Nessuno
         * 📤 Output: Overlay loading visualizzato
         */
        showLoadingOverlay() {
            this.createOverlay('loading', `
                <div class="chatbot-tasting-overlay-content">
                    <div class="chatbot-loading-spinner"></div>
                    <p class="chatbot-loading-text">${ChatbotConfig.t('loading')}</p>
                </div>
            `);
        },

        /**
         * 🎯 Scopo: Mostra overlay di errore
         * 📥 Input: message (string)
         * 📤 Output: Overlay errore visualizzato
         */
        showErrorOverlay(message) {
            this.createOverlay('error', `
                <div class="chatbot-tasting-overlay-content">
                    <h2 class="chatbot-error-title">${ChatbotConfig.t('error')}</h2>
                    <p class="chatbot-error-message">${message}</p>
                    <button class="chatbot-error-close" onclick="ChatbotTasting.removeOverlay()">
                        ${ChatbotConfig.t('close')}
                    </button>
                </div>
            `);
        },

        /**
         * 🎯 Scopo: Rimuove overlay corrente
         * 📥 Input: Nessuno
         * 📤 Output: Overlay rimosso
         */
        removeOverlay() {
            // Cerca overlay sia nel shadowRoot che nella finestra chatbot
            let overlay = ChatbotUI.shadowRoot.querySelector('.chatbot-tasting-overlay');
            if (!overlay && ChatbotUI.isEmbedded) {
                const chatbotWindow = ChatbotUI.shadowRoot.querySelector('.chatbot-window');
                if (chatbotWindow) {
                    overlay = chatbotWindow.querySelector('.chatbot-tasting-overlay');
                }
            }
            if (overlay) {
                overlay.remove();
            }
        }
    };

    /**
     * 🎯 MODULO: ChatbotExperience
     * 🎯 Scopo: Gestisce overlay delle experience cards
     * 📋 Responsabilità: Mostra dettagli esperienza, gestisce azioni
     */
    const ChatbotExperience = {
        /**
         * 🎯 Scopo: Mostra overlay con dettagli esperienza
         * 📥 Input: experience (object)
         * 📤 Output: Overlay visualizzato
         */
        showOverlay(experience) {
            // Rimuovi qualsiasi overlay precedente prima di crearne uno nuovo
            this.closeOverlay();
            
            const overlayHTML = `
                <div class="chatbot-experience-detail-overlay" data-experience-id="${experience.id || ''}" data-experience-index="${experience.index !== undefined ? experience.index : ''}">
                    <div class="chatbot-experience-detail-content">
                        <button class="chatbot-experience-detail-close" aria-label="Chiudi">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        
                        <div class="chatbot-experience-detail-image" style="background-image: url('${experience.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'}')">
                            <div class="chatbot-experience-detail-image-overlay"></div>
                        </div>
                        
                        <div class="chatbot-experience-detail-info">
                            <h3 class="chatbot-experience-detail-title">${experience.title || 'Esperienza'}</h3>
                            <p class="chatbot-experience-detail-description">${experience.additonal_description || experience.description || ''}</p>
                            
                            <div class="chatbot-experience-detail-chips">
                                ${experience.duration ? `<div class="chatbot-experience-detail-chip">${experience.duration}</div>` : ''}
                                ${experience.price ? `<div class="chatbot-experience-detail-chip">${experience.price}</div>` : ''}
                            </div>
                            
                            <div class="chatbot-experience-detail-actions">
                                <button class="chatbot-experience-detail-action" data-action="discover" data-url="${experience.discoverMoreLink || '#'}">
                                    ${ChatbotConfig.t('discoverMore')}
                                </button>
                                <button class="chatbot-experience-detail-action" data-action="chat">
                                    ${ChatbotConfig.t('chatForInfo')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Crea elemento overlay
            const overlayElement = document.createElement('div');
            overlayElement.innerHTML = overlayHTML;
            const overlay = overlayElement.firstElementChild;
            
            // Se siamo in modalità embedded, appendi alla finestra chatbot
            // altrimenti appendi al shadowRoot per il posizionamento fixed
            if (ChatbotUI.isEmbedded) {
                const chatbotWindow = ChatbotUI.shadowRoot.querySelector('.chatbot-window');
                if (chatbotWindow) {
                    chatbotWindow.appendChild(overlay);
                } else {
                    ChatbotUI.shadowRoot.appendChild(overlay);
                }
            } else {
                ChatbotUI.shadowRoot.appendChild(overlay);
            }
            
            // Setup event listeners
            this.setupOverlayListeners();
        },

        /**
         * 🎯 Scopo: Configura event listeners per overlay
         * 📥 Input: Nessuno
         * 📤 Output: Event listeners configurati
         */
        setupOverlayListeners() {
            // Cerca overlay sia nel shadowRoot che nella finestra chatbot
            let overlay = ChatbotUI.shadowRoot.querySelector('.chatbot-experience-detail-overlay');
            if (!overlay && ChatbotUI.isEmbedded) {
                const chatbotWindow = ChatbotUI.shadowRoot.querySelector('.chatbot-window');
                if (chatbotWindow) {
                    overlay = chatbotWindow.querySelector('.chatbot-experience-detail-overlay');
                }
            }
            const closeButton = ChatbotUI.shadowRoot.querySelector('.chatbot-experience-detail-close');
            const actionButtons = ChatbotUI.shadowRoot.querySelectorAll('.chatbot-experience-detail-action');
            
            // Close button
            if (closeButton) {
                closeButton.addEventListener('click', () => this.closeOverlay());
            }
            
            // Click outside to close
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.closeOverlay();
                    }
                });
            }
            
            // Action buttons
            actionButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const action = button.getAttribute('data-action');
                    const url = button.getAttribute('data-url');
                    
                    if (action === 'discover' && url && url !== '#') {
                        window.open(url, '_blank');
                    } else if (action === 'chat') {
                        // Ottieni i dati dell'esperienza dall'overlay
                        const title = overlay.querySelector('.chatbot-experience-detail-title').textContent;
                        const experienceId = button.closest('.chatbot-experience-detail-overlay').dataset.experienceId;
                        const experienceIndex = button.closest('.chatbot-experience-detail-overlay').dataset.experienceIndex;
                        const experienceData = {
                            title: title,
                            id: experienceId,
                            index: experienceIndex !== '' ? parseInt(experienceIndex) : undefined
                        };
                        this.closeOverlay();
                        this.showChatOverlay(experienceData);
                    }
                });
            });
            
            // Escape key
            document.addEventListener('keydown', this.handleEscapeKey);
        },

        /**
         * 🎯 Scopo: Gestisce tasto Escape
         * 📥 Input: event
         * 📤 Output: Overlay chiuso se necessario
         */
        handleEscapeKey(e) {
            if (e.key === 'Escape') {
                ChatbotExperience.closeOverlay();
            }
        },

        /**
         * 🎯 Scopo: Chiude overlay esperienza
         * 📥 Input: Nessuno
         * 📤 Output: Overlay rimosso
         */
        closeOverlay() {
            // Cerca overlay sia nel shadowRoot che nella finestra chatbot
            let overlay = ChatbotUI.shadowRoot.querySelector('.chatbot-experience-detail-overlay');
            if (!overlay && ChatbotUI.isEmbedded) {
                const chatbotWindow = ChatbotUI.shadowRoot.querySelector('.chatbot-window');
                if (chatbotWindow) {
                    overlay = chatbotWindow.querySelector('.chatbot-experience-detail-overlay');
                }
            }
            if (overlay) {
                overlay.remove();
            }
            document.removeEventListener('keydown', this.handleEscapeKey);
        },

        /**
         * 🎯 Scopo: Mostra overlay chat per esperienza specifica
         * 📥 Input: experienceData (object con title e id)
         * 📤 Output: Overlay chat visualizzato
         */
        showChatOverlay(experienceData) {
            const chatOverlayHTML = `
                <div class="chatbot-tasting-overlay chatbot-tasting-overlay--experience-chat">
                    <div class="chatbot-tasting-chat-container">
                        <div class="chatbot-tasting-chat-header">
                            <button class="chatbot-tasting-chat-back" id="experience-chat-back-button" aria-label="Torna ai dettagli" title="Torna ai dettagli">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="15,18 9,12 15,6"></polyline>
                                </svg>
                            </button>
                            <h3 class="chatbot-tasting-chat-title">${experienceData.title || 'Esperienza'}</h3>
                            <button class="chatbot-tasting-chat-close" id="experience-chat-close-button">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="chatbot-tasting-messages" id="experience-chat-messages">
                            <div class="chatbot-message chatbot-message--bot">
                                <div class="chatbot-message-content">
                                    Ciao! 👋 Sono qui per aiutarti con domande su "${experienceData.title}". Cosa vorresti sapere?
                                </div>
                                <div class="chatbot-message-time">${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                        
                        <!-- Typing indicator -->
                        <div class="chatbot-typing" id="experience-chat-typing-indicator" style="display: none;">
                            <div class="chatbot-typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div class="chatbot-typing-text">${ChatbotConfig.t('typing')}</div>
                        </div>
                        
                        <!-- Area input -->
                        <div class="chatbot-input-area" id="experience-chat-input-area">
                            <form class="chatbot-input-form" id="experience-chat-input-form">
                                <div class="chatbot-input-container">
                                    <input 
                                        type="text" 
                                        class="chatbot-input" 
                                        id="experience-chat-input"
                                        placeholder="${ChatbotConfig.t('placeholder')}" 
                                        autocomplete="off"
                                    >
                                    <button 
                                        type="submit" 
                                        class="chatbot-send-button" 
                                        id="experience-chat-send-button"
                                        aria-label="${ChatbotConfig.t('sendLabel')}"
                                        disabled
                                    >
                                        <svg viewBox="0 0 24 24">
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            
            // Crea elemento overlay
            const overlayElement = document.createElement('div');
            overlayElement.innerHTML = chatOverlayHTML;
            const overlay = overlayElement.firstElementChild;
            
            // Salva i dati dell'esperienza nell'overlay per riferimento futuro
            overlay.dataset.experienceId = experienceData.id;
            overlay.dataset.experienceTitle = experienceData.title;
            overlay.dataset.experienceIndex = experienceData.index !== undefined ? experienceData.index : '';
            
            // Se siamo in modalità embedded, appendi alla finestra chatbot
            // altrimenti appendi al shadowRoot per il posizionamento fixed
            if (ChatbotUI.isEmbedded) {
                const chatbotWindow = ChatbotUI.shadowRoot.querySelector('.chatbot-window');
                if (chatbotWindow) {
                    chatbotWindow.appendChild(overlay);
                } else {
                    ChatbotUI.shadowRoot.appendChild(overlay);
                }
            } else {
                ChatbotUI.shadowRoot.appendChild(overlay);
            }
            
            // Setup event listeners per la chat
            this.setupChatOverlayListeners();
        },

        /**
         * 🎯 Scopo: Configura event listeners per chat overlay esperienza
         * 📥 Input: Nessuno
         * 📤 Output: Event listeners configurati
         */
        setupChatOverlayListeners() {
            const form = ChatbotUI.shadowRoot.querySelector('#experience-chat-input-form');
            const input = ChatbotUI.shadowRoot.querySelector('#experience-chat-input');
            const sendButton = ChatbotUI.shadowRoot.querySelector('#experience-chat-send-button');
            const closeButton = ChatbotUI.shadowRoot.querySelector('#experience-chat-close-button');
            const backButton = ChatbotUI.shadowRoot.querySelector('#experience-chat-back-button');

            // Back button
            if (backButton) {
                backButton.addEventListener('click', () => {
                    this.goBackToDetailOverlay();
                });
            }

            // Close button
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.closeChatOverlay();
                });
            }

            if (form && input && sendButton) {
                // Form submit
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleExperienceChatSubmit();
                });

                // Input events
                input.addEventListener('input', () => {
                    sendButton.disabled = input.value.trim().length === 0;
                });

                // Enter key
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (input.value.trim().length > 0) {
                            this.handleExperienceChatSubmit();
                        }
                    }
                });
            }

            // Escape key
            document.addEventListener('keydown', this.handleChatEscapeKey);
            
            // Focus sull'input
            if (input) {
                setTimeout(() => input.focus(), 300);
            }
        },

        /**
         * 🎯 Scopo: Gestisce tasto Escape per chat overlay
         * 📥 Input: event
         * 📤 Output: Overlay chiuso se necessario
         */
        handleChatEscapeKey(e) {
            if (e.key === 'Escape') {
                ChatbotExperience.closeChatOverlay();
            }
        },

        /**
         * 🎯 Scopo: Gestisce invio messaggio chat esperienza
         * 📥 Input: Nessuno
         * 📤 Output: Messaggio inviato e risposta API
         */
        async handleExperienceChatSubmit() {
            const input = ChatbotUI.shadowRoot.querySelector('#experience-chat-input');
            const sendButton = ChatbotUI.shadowRoot.querySelector('#experience-chat-send-button');
            const messagesContainer = ChatbotUI.shadowRoot.querySelector('#experience-chat-messages');
            // Cerca overlay sia nel shadowRoot che nella finestra chatbot
            let overlay = ChatbotUI.shadowRoot.querySelector('.chatbot-tasting-overlay--experience-chat');
            if (!overlay && ChatbotUI.isEmbedded) {
                const chatbotWindow = ChatbotUI.shadowRoot.querySelector('.chatbot-window');
                if (chatbotWindow) {
                    overlay = chatbotWindow.querySelector('.chatbot-tasting-overlay--experience-chat');
                }
            }

            if (!input || !sendButton || !messagesContainer || !overlay) return;

            const message = input.value.trim();
            if (!message) return;

            const experienceId = overlay.dataset.experienceId;

            // Disabilita input durante invio
            sendButton.disabled = true;
            input.disabled = true;

            // Aggiungi messaggio utente
            this.addExperienceChatMessage(messagesContainer, message, 'user');
            
            // Reset input
            input.value = '';

            try {
                // Mostra typing indicator
                this.showExperienceChatTyping();
                
                // Chiamata API esperienza
                const response = await this.callExperienceAPI(experienceId, message);
                
                // Nasconde typing indicator
                this.hideExperienceChatTyping();
                
                // Mostra risposta bot
                if (response) {
                    this.addExperienceChatMessage(messagesContainer, response, 'bot');
                }
                
            } catch (error) {
                console.error('❌ Errore invio messaggio esperienza:', error);
                this.hideExperienceChatTyping();
                this.addExperienceChatMessage(messagesContainer, 'Scusa, c\'è stato un problema. Riprova più tardi.', 'bot');
            } finally {
                // Riabilita input
                input.disabled = false;
                input.focus();
            }
        },

        /**
         * 🎯 Scopo: Chiama API per chat esperienza
         * 📥 Input: cardId (string), userMessage (string)
         * 📤 Output: Risposta API
         */
        async callExperienceAPI(cardId, userMessage) {
            if (!ChatbotAPI.isAuthenticated) {
                throw new Error('API non autenticata');
            }

            const payload = {
                cardId: cardId,
                userMessage: userMessage,
                language: ChatbotConfig.current.language || 'it'
            };

            const response = await fetch(`${ChatbotAPI.baseURL}/api/winery/experiences/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ChatbotAPI.token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Errore API esperienza: ${response.status}`);
            }

            const data = await response.json();

            // Gestione risposta API esperienza: usa la proprietà 'reply'
            if (data.reply) {
                return data.reply;
            }
            
            return 'Scusa, non sono riuscito a elaborare la tua richiesta.';
        },

        /**
         * 🎯 Scopo: Aggiunge messaggio alla chat esperienza
         * 📥 Input: container, text, type
         * 📤 Output: Messaggio aggiunto
         */
        addExperienceChatMessage(container, text, type) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chatbot-message chatbot-message--${type}`;
            messageDiv.setAttribute('data-message-id', Date.now() + Math.random());

            const contentDiv = document.createElement('div');
            contentDiv.className = 'chatbot-message-content';
            // Usa formattazione per link e grassetto
            contentDiv.innerHTML = ChatbotMessages.formatMessageText(text);

            const timeDiv = document.createElement('div');
            timeDiv.className = 'chatbot-message-time';
            timeDiv.textContent = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(timeDiv);
            
            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight;
        },

        /**
         * 🎯 Scopo: Mostra typing indicator chat esperienza
         * 📥 Input: Nessuno
         * 📤 Output: Typing indicator mostrato
         */
        showExperienceChatTyping() {
            const typingIndicator = ChatbotUI.shadowRoot.querySelector('#experience-chat-typing-indicator');
            if (typingIndicator) {
                typingIndicator.style.display = 'flex';
            }
        },

        /**
         * 🎯 Scopo: Nasconde typing indicator chat esperienza
         * 📥 Input: Nessuno
         * 📤 Output: Typing indicator nascosto
         */
        hideExperienceChatTyping() {
            const typingIndicator = ChatbotUI.shadowRoot.querySelector('#experience-chat-typing-indicator');
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
        },

        /**
         * 🎯 Scopo: Torna al detail overlay dall'experience chat
         * 📥 Input: Nessuno
         * 📤 Output: Chat overlay chiuso e detail overlay mostrato
         */
        goBackToDetailOverlay() {
            // Cerca overlay sia nel shadowRoot che nella finestra chatbot
            let chatOverlay = ChatbotUI.shadowRoot.querySelector('.chatbot-tasting-overlay--experience-chat');
            if (!chatOverlay && ChatbotUI.isEmbedded) {
                const chatbotWindow = ChatbotUI.shadowRoot.querySelector('.chatbot-window');
                if (chatbotWindow) {
                    chatOverlay = chatbotWindow.querySelector('.chatbot-tasting-overlay--experience-chat');
                }
            }
            if (!chatOverlay) return;
            
            const experienceIndex = parseInt(chatOverlay.dataset.experienceIndex);
            
            // Chiudi la chat
            this.closeChatOverlay();
            
            // Riapri il detail overlay (controlla che sia un numero valido, incluso 0)
            if (!isNaN(experienceIndex) && experienceIndex >= 0) {
                // Trova l'ultimo messaggio con experience cards (il più recente)
                const experienceMessage = ChatbotMessages.messages.slice().reverse().find(msg => msg.isExperienceCards);
                if (experienceMessage && experienceMessage.experiences[experienceIndex]) {
                    const experience = experienceMessage.experiences[experienceIndex];
                    experience.index = experienceIndex;
                    this.showOverlay(experience);
                }
            }
        },

        /**
         * 🎯 Scopo: Chiude overlay chat esperienza
         * 📥 Input: Nessuno
         * 📤 Output: Overlay rimosso
         */
        closeChatOverlay() {
            // Cerca overlay sia nel shadowRoot che nella finestra chatbot
            let overlay = ChatbotUI.shadowRoot.querySelector('.chatbot-tasting-overlay--experience-chat');
            if (!overlay && ChatbotUI.isEmbedded) {
                const chatbotWindow = ChatbotUI.shadowRoot.querySelector('.chatbot-window');
                if (chatbotWindow) {
                    overlay = chatbotWindow.querySelector('.chatbot-tasting-overlay--experience-chat');
                }
            }
            if (overlay) {
                overlay.remove();
            }
            document.removeEventListener('keydown', this.handleChatEscapeKey);
        }
    };

    /**
     * ⚙️ MODULO: ChatbotConfig
     * 🎯 Scopo: Gestisce configurazione del chatbot
     * 📋 Responsabilità: Opzioni default, merge configurazioni, validazione
     */
    const ChatbotConfig = {
        /**
         * 📝 Configurazione di default
         */
        defaults: {
            language: 'it',
            position: 'bottom-right',
            theme: 'light',
            clientId: '89b90056-4cc4-054a-a3db-9a3c0ded7efc',
            apiEndpoint: null,
            welcomeMessage: 'Ciao! 👋 Sono il tuo assistente virtuale. Come posso aiutarti oggi?',
            chatbotName: null, // Sarà automaticamente impostato in base alla lingua
            showQuickActions: true, // Flag per mostrare/nascondere le quick actions
            containerId: null // ID del container per modalità embedded (null = modalità floating)
        },

        current: {},

        /**
         * 🌐 Testi multilingua
         */
        translations: {
            it: {
                title: '{chatbotName}',
                welcomeMessage: 'Ciao! 👋 Sono il tuo assistente virtuale. Come posso aiutarti oggi?',
                placeholder: 'Scrivi un messaggio...',
                typing: 'L\'assistente sta scrivendo...',
                toggleLabel: 'Apri chat',
                closeLabel: 'Chiudi chat',
                sendLabel: 'Invia messaggio',
                quickAction1: 'Organizzate visite?',
                quickAction2: 'Degustiamo insieme?',
                powered: 'Powered by {chatbotName} v1.0',
                // Tasting
                selectLevel: 'Seleziona il tuo livello',
                beginner: 'Principiante',
                expert: 'Esperto',
                beginnerDesc: 'Perfetto per chi inizia a scoprire il mondo del vino',
                expertDesc: 'Per degustatori esperti che vogliono approfondire',
                stage: 'Fase',
                start: 'Inizia',
                continue: 'Continua la degustazione',
                endTasting: 'Termina Degustazione',
                tastingCompleted: '🍷 Degustazione completata! Grazie per aver partecipato.',
                loading: 'Caricamento...',
                error: 'Errore',
                close: 'Chiudi',
                // Experience actions
                discoverMore: 'Scopri di più',
                chatForInfo: 'Chatta per avere info',
                included: 'Incluso'
            },
            en: {
                title: '{chatbotName}',
                welcomeMessage: 'Hello! 👋 I\'m your virtual assistant. How can I help you today?',
                placeholder: 'Type a message...',
                typing: 'Assistant is typing...',
                toggleLabel: 'Open chat',
                closeLabel: 'Close chat',
                sendLabel: 'Send message',
                quickAction1: 'Do you organize visits?',
                quickAction2: 'Let\'s taste together?',
                powered: 'Powered by {chatbotName} v1.0',
                // Tasting
                selectLevel: 'Select your level',
                beginner: 'Beginner',
                expert: 'Expert',
                beginnerDesc: 'Perfect for those starting to discover the wine world',
                expertDesc: 'For experienced tasters who want to deepen their knowledge',
                stage: 'Stage',
                start: 'Start',
                continue: 'Continue tasting',
                endTasting: 'End Tasting',
                tastingCompleted: '🍷 Tasting completed! Thank you for participating.',
                loading: 'Loading...',
                error: 'Error',
                close: 'Close',
                // Experience actions
                discoverMore: 'Discover more',
                chatForInfo: 'Chat for info',
                included: 'Included'
            }
        },

        /**
         * 🎯 Scopo: Unisce configurazione utente con defaults
         * 📥 Input: userConfig (object)
         * 📤 Output: Configurazione finale
         */
        merge(userConfig = {}) {
            this.current = {
                ...this.defaults,
                ...userConfig
            };
            
            return this.current;
        },

        /**
         * 🎯 Scopo: Ottiene testo tradotto per lingua corrente
         * 📥 Input: key (string) - chiave traduzione
         * 📤 Output: Testo tradotto con placeholder sostituiti
         */
        t(key) {
            const lang = this.current.language || 'it';
            let text = this.translations[lang]?.[key] || this.translations.it[key] || key;
            
            // Determina il nome del chatbot di default in base alla lingua
            const defaultNames = {
                'it': 'Assistente Virtuale',
                'en': 'Virtual Assistant'
            };
            
            const chatbotName = this.current.chatbotName || defaultNames[lang] || defaultNames.it;
            
            // Sostituisce placeholder con valori di configurazione
            text = text.replace('{chatbotName}', chatbotName);
            
            return text;
        },

        /**
         * 🎯 Scopo: Cambia lingua e aggiorna UI
         * 📥 Input: newLanguage (string)
         * 📤 Output: UI aggiornata
         */
        setLanguage(newLanguage) {
            if (!this.translations[newLanguage]) {
                console.warn(`⚠️ Lingua '${newLanguage}' non supportata`);
                return false;
            }

            const oldLanguage = this.current.language;
            this.current.language = newLanguage;
            
            // Aggiorna UI
            this.updateUI();
            
            // Aggiorna messaggio benvenuto se presente
            this.updateWelcomeMessage();
            
            return true;
        },

        /**
         * 🎯 Scopo: Aggiorna testi UI per lingua corrente
         * 📥 Input: Nessuno
         * 📤 Output: UI aggiornata
         */
        updateUI() {
            if (!ChatbotUI.shadowRoot) return;

            const elements = {
                '.chatbot-title': this.t('title'),
                '.chatbot-input': { placeholder: this.t('placeholder') },
                '.chatbot-toggle': { 'aria-label': this.t('toggleLabel') },
                '.chatbot-close': { 'aria-label': this.t('closeLabel') },
                '.chatbot-send-button': { 'aria-label': this.t('sendLabel') },
                '.chatbot-typing-text': this.t('typing'),
                '.chatbot-powered': this.t('powered')
            };

            // Gestisce visibilità e aggiorna quick actions
            const quickActionsContainer = ChatbotUI.shadowRoot.querySelector('.chatbot-quick-actions');
            if (quickActionsContainer) {
                // Controlla visibilità basata su flag
                if (this.current.showQuickActions) {
                    quickActionsContainer.style.display = 'flex';
                    
                    // Aggiorna testo delle quick actions se visibili (mantenendo le icone)
                    const quickActions = ChatbotUI.shadowRoot.querySelectorAll('.chatbot-quick-action');
                    if (quickActions.length >= 1) {
                        // Mantieni l'icona SVG e aggiorna solo il testo
                        const icon = quickActions[0].querySelector('.chatbot-quick-action-icon');
                        quickActions[0].innerHTML = (icon ? icon.outerHTML : '') + this.t('quickAction1');
                        quickActions[0].setAttribute('data-text', this.t('quickAction1'));
                    }
                    if (quickActions.length >= 2) {
                        // Mantieni l'icona SVG e aggiorna solo il testo
                        const icon = quickActions[1].querySelector('.chatbot-quick-action-icon');
                        quickActions[1].innerHTML = (icon ? icon.outerHTML : '') + this.t('quickAction2');
                        quickActions[1].setAttribute('data-text', this.t('quickAction2'));
                    }
                } else {
                    quickActionsContainer.style.display = 'none';
                }
            }

            // Aggiorna altri elementi
            Object.entries(elements).forEach(([selector, value]) => {
                const element = ChatbotUI.shadowRoot.querySelector(selector);
                if (element) {
                    if (typeof value === 'string') {
                        element.textContent = value;
                    } else if (typeof value === 'object') {
                        Object.entries(value).forEach(([attr, val]) => {
                            element.setAttribute(attr, val);
                        });
                    }
                }
            });

            // Aggiorna indicatore lingua corrente
            const currentLangDisplay = ChatbotUI.shadowRoot.querySelector('.chatbot-language-current');
            if (currentLangDisplay) {
                currentLangDisplay.textContent = this.current.language.toUpperCase();
            }
        },

        /**
         * 🎯 Scopo: Aggiorna messaggio di benvenuto
         * 📥 Input: Nessuno
         * 📤 Output: Messaggio benvenuto aggiornato
         */
        updateWelcomeMessage() {
            if (!ChatbotUI.shadowRoot) return;

            const welcomeElement = ChatbotUI.shadowRoot.querySelector('.chatbot-welcome-message .chatbot-message-content');
            if (welcomeElement) {
                // Usa formattazione per link e grassetto
                welcomeElement.innerHTML = ChatbotMessages.formatMessageText(this.t('welcomeMessage'));
            }
        }
    };

    /**
     * 🤖 MODULO: ChatbotCore
     * 🎯 Scopo: Orchestratore principale
     * 📋 Responsabilità: Inizializzazione, API pubblica, lifecycle management
     */
    const ChatbotCore = {
        /**
         * 📝 Proprietà del modulo
         */
        isInitialized: false,
        container: null,

        /**
         * 🎯 Scopo: Inizializza chatbot completo
         * 📥 Input: config (object)
         * 📤 Output: Chatbot funzionante
         * 🔧 Esempio: await ChatbotCore.init({ language: 'it' })
         */
        async init(config = {}) {
            try {

                // Previeni inizializzazione multipla
                if (this.isInitialized) {
                    return false;
                }

                // Applica configurazione
                ChatbotConfig.merge(config);

                // Gestisci container: embedded o floating
                if (config.containerId) {
                    // Modalità embedded: usa container esistente
                    this.container = document.getElementById(config.containerId);
                    if (!this.container) {
                        throw new Error(`❌ Container con ID '${config.containerId}' non trovato`);
                    }
                } else {
                    // Modalità floating: crea nuovo container
                    this.container = document.createElement('div');
                    this.container.className = 'chatbot-container';
                    document.body.appendChild(this.container);
                }

                // Inizializza UI
                await ChatbotUI.init(this.container);

                // Inizializza e autentica API
                try {
                    ChatbotAPI.init(config.clientId);
                    await ChatbotAPI.authenticate();
                } catch (error) {
                }

                this.isInitialized = true;

                return true;

            } catch (error) {
                console.error('❌ Errore inizializzazione Chatbot:', error);
                throw error;
            }
        },


        /**
         * 🎯 Scopo: Distrugge chatbot e pulisce risorse
         * 📥 Input: Nessuno
         * 📤 Output: Chatbot rimosso
         */
        destroy() {
            try {
                if (!this.isInitialized) {
                    console.warn('⚠️ Chatbot non inizializzato');
                    return;
                }

                // Rimuovi container dal DOM
                if (this.container && this.container.parentNode) {
                    this.container.parentNode.removeChild(this.container);
                }

                // Reset proprietà
                this.isInitialized = false;
                this.container = null;
                ChatbotUI.shadowRoot = null;
                ChatbotUI.isVisible = false;
                ChatbotMessages.messages = [];
                ChatbotAPI.reset();

            } catch (error) {
                console.error('❌ Errore durante distruzione:', error);
            }
        },

        /**
         * 🎯 Scopo: Verifica se chatbot è inizializzato
         * 📥 Input: Nessuno
         * 📤 Output: boolean
         */
        get isInitialized() {
            return this._initialized || false;
        },

        set isInitialized(value) {
            this._initialized = value;
        }
    };

    /**
     * 🌐 API PUBBLICA GLOBALE
     * 🎯 Scopo: Interfaccia pubblica per integrazione
     */
    window.Chatbot = {
        /**
         * 🎯 Scopo: Inizializza chatbot
         * 📥 Input: config (object)
         * 📤 Output: Promise<boolean>
         */
        async init(config = {}) {
            const result = await ChatbotCore.init(config);
            
            // Aggiungi accesso debug per testing
            this._debug = {
                ui: ChatbotUI,
                config: ChatbotConfig,
                messages: ChatbotMessages,
                api: ChatbotAPI,
                themes: ChatbotThemeManager
            };
            
            return result;
        },

        /**
         * 🎯 Scopo: Distrugge chatbot
         * 📥 Input: Nessuno
         * 📤 Output: void
         */
        destroy() {
            ChatbotCore.destroy();
            this._debug = null;
        },

        /**
         * 🎯 Scopo: Verifica stato inizializzazione
         * 📥 Input: Nessuno
         * 📤 Output: boolean
         */
        get isInitialized() {
            return ChatbotCore.isInitialized;
        },

        /**
         * 🎨 Scopo: Imposta tema del chatbot
         * 📥 Input: themeName (string)
         * 📤 Output: boolean
         */
        setTheme(themeName) {
            if (!this.isInitialized) {
                console.warn('🤖 Chatbot non inizializzato');
                return false;
            }
            
            if (ChatbotThemeManager.themes[themeName]) {
                ChatbotThemeManager.applyTheme(themeName);
                return true;
            }
            
            console.warn(`🎨 Tema '${themeName}' non trovato`);
            return false;
        },

        /**
         * 🎨 Scopo: Ottiene tema corrente
         * 📥 Input: Nessuno
         * 📤 Output: string | null
         */
        getTheme() {
            if (!this.isInitialized) {
                return null;
            }
            return ChatbotThemeManager.getCurrentTheme();
        },

        /**
         * 🎨 Scopo: Ottiene temi disponibili
         * 📥 Input: Nessuno
         * 📤 Output: string[] | null
         */
        getAvailableThemes() {
            if (!this.isInitialized) {
                return null;
            }
            return ChatbotThemeManager.getAvailableThemes();
        },

        /**
         * 🛠️ API di debug (solo sviluppo)
         * 📥 Input: Nessuno
         * 📤 Output: Oggetti interni
         */
        _debug: {
            ui: ChatbotUI,
            messages: ChatbotMessages,
            config: ChatbotConfig,
            api: ChatbotAPI,
            core: ChatbotCore,
            themes: ChatbotThemeManager
        }
    };
})(); 