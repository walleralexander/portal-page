// =============================================================================
// Portal Page – Themes Plugin
// =============================================================================
// Provides 10+ built-in themes + custom color overrides via YAML.
//
// Config:
//   theme:
//     name: "ocean"              # Built-in theme name
//     custom:                    # Optional custom overrides
//       primary: "#1a1a2e"
//       background: "#f7f8fa"
//       card: "#ffffff"
//       text: "#1a1a2e"
//       text_light: "#718096"
//       border: "#e2e8f0"
//       accent: "#2b6cb0"
//       radius: "8px"

const BUILT_IN_THEMES = {
    default: {
        label: 'Standard',
        light: {},   // uses CSS defaults
        dark: {}
    },
    ocean: {
        label: '🌊 Ocean',
        light: {
            '--primary-color': '#0c4a6e',
            '--background-color': '#f0f9ff',
            '--card-background': '#ffffff',
            '--text-color': '#0c4a6e',
            '--text-light': '#64748b',
            '--border-color': '#bae6fd',
            '--hover-color': '#0284c7',
        },
        dark: {
            '--background-color': '#0c1222',
            '--card-background': '#0f1d32',
            '--text-color': '#bae6fd',
            '--text-light': '#7dd3fc',
            '--border-color': '#1e3a5f',
            '--hover-color': '#38bdf8',
        }
    },
    forest: {
        label: '🌲 Forest',
        light: {
            '--primary-color': '#14532d',
            '--background-color': '#f0fdf4',
            '--card-background': '#ffffff',
            '--text-color': '#14532d',
            '--text-light': '#4b5563',
            '--border-color': '#bbf7d0',
            '--hover-color': '#16a34a',
        },
        dark: {
            '--background-color': '#071209',
            '--card-background': '#0d1f12',
            '--text-color': '#bbf7d0',
            '--text-light': '#86efac',
            '--border-color': '#1a3a22',
            '--hover-color': '#4ade80',
        }
    },
    sunset: {
        label: '🌅 Sunset',
        light: {
            '--primary-color': '#7c2d12',
            '--background-color': '#fff7ed',
            '--card-background': '#ffffff',
            '--text-color': '#7c2d12',
            '--text-light': '#78716c',
            '--border-color': '#fed7aa',
            '--hover-color': '#ea580c',
        },
        dark: {
            '--background-color': '#1a0e05',
            '--card-background': '#261a0e',
            '--text-color': '#fed7aa',
            '--text-light': '#fdba74',
            '--border-color': '#4a2510',
            '--hover-color': '#fb923c',
        }
    },
    lavender: {
        label: '💜 Lavender',
        light: {
            '--primary-color': '#4c1d95',
            '--background-color': '#f5f3ff',
            '--card-background': '#ffffff',
            '--text-color': '#4c1d95',
            '--text-light': '#6b7280',
            '--border-color': '#ddd6fe',
            '--hover-color': '#7c3aed',
        },
        dark: {
            '--background-color': '#0f0720',
            '--card-background': '#1a0e30',
            '--text-color': '#ddd6fe',
            '--text-light': '#c4b5fd',
            '--border-color': '#2e1a5e',
            '--hover-color': '#a78bfa',
        }
    },
    rose: {
        label: '🌹 Rose',
        light: {
            '--primary-color': '#881337',
            '--background-color': '#fff1f2',
            '--card-background': '#ffffff',
            '--text-color': '#881337',
            '--text-light': '#71717a',
            '--border-color': '#fecdd3',
            '--hover-color': '#e11d48',
        },
        dark: {
            '--background-color': '#1a0810',
            '--card-background': '#2a0e1a',
            '--text-color': '#fecdd3',
            '--text-light': '#fda4af',
            '--border-color': '#4a1528',
            '--hover-color': '#fb7185',
        }
    },
    slate: {
        label: '🪨 Slate',
        light: {
            '--primary-color': '#1e293b',
            '--background-color': '#f8fafc',
            '--card-background': '#ffffff',
            '--text-color': '#1e293b',
            '--text-light': '#64748b',
            '--border-color': '#e2e8f0',
            '--hover-color': '#475569',
        },
        dark: {
            '--background-color': '#0f172a',
            '--card-background': '#1e293b',
            '--text-color': '#e2e8f0',
            '--text-light': '#94a3b8',
            '--border-color': '#334155',
            '--hover-color': '#94a3b8',
        }
    },
    nord: {
        label: '❄️ Nord',
        light: {
            '--primary-color': '#2e3440',
            '--background-color': '#eceff4',
            '--card-background': '#ffffff',
            '--text-color': '#2e3440',
            '--text-light': '#4c566a',
            '--border-color': '#d8dee9',
            '--hover-color': '#5e81ac',
        },
        dark: {
            '--background-color': '#2e3440',
            '--card-background': '#3b4252',
            '--text-color': '#eceff4',
            '--text-light': '#d8dee9',
            '--border-color': '#434c5e',
            '--hover-color': '#88c0d0',
        }
    },
    dracula: {
        label: '🧛 Dracula',
        light: {
            '--primary-color': '#282a36',
            '--background-color': '#f8f8f2',
            '--card-background': '#ffffff',
            '--text-color': '#282a36',
            '--text-light': '#6272a4',
            '--border-color': '#d9dbe6',
            '--hover-color': '#bd93f9',
        },
        dark: {
            '--background-color': '#282a36',
            '--card-background': '#44475a',
            '--text-color': '#f8f8f2',
            '--text-light': '#6272a4',
            '--border-color': '#44475a',
            '--hover-color': '#bd93f9',
        }
    },
    solarized: {
        label: '☀️ Solarized',
        light: {
            '--primary-color': '#073642',
            '--background-color': '#fdf6e3',
            '--card-background': '#eee8d5',
            '--text-color': '#657b83',
            '--text-light': '#93a1a1',
            '--border-color': '#eee8d5',
            '--hover-color': '#268bd2',
        },
        dark: {
            '--background-color': '#002b36',
            '--card-background': '#073642',
            '--text-color': '#839496',
            '--text-light': '#586e75',
            '--border-color': '#073642',
            '--hover-color': '#2aa198',
        }
    },
    midnight: {
        label: '🌙 Midnight',
        light: {
            '--primary-color': '#1a1a2e',
            '--background-color': '#eef2ff',
            '--card-background': '#ffffff',
            '--text-color': '#1a1a2e',
            '--text-light': '#6366f1',
            '--border-color': '#c7d2fe',
            '--hover-color': '#4f46e5',
        },
        dark: {
            '--background-color': '#030712',
            '--card-background': '#0a0f1e',
            '--text-color': '#c7d2fe',
            '--text-light': '#818cf8',
            '--border-color': '#1e1b4b',
            '--hover-color': '#818cf8',
        }
    }
};

// ---- Theme Engine -----------------------------------------------------------

const ThemeEngine = {
    _currentName: 'default',
    _styleEl: null,

    apply(themeName, customOverrides) {
        const theme = BUILT_IN_THEMES[themeName];
        if (!theme && !customOverrides) {
            console.warn(`[Themes] Unknown theme: "${themeName}"`);
            return;
        }

        this._currentName = themeName || 'default';

        // Build CSS variable overrides
        const lightVars = { ...(theme?.light || {}) };
        const darkVars  = { ...(theme?.dark || {}) };

        // Apply custom overrides from YAML
        if (customOverrides) {
            const map = {
                primary:    '--primary-color',
                background: '--background-color',
                card:       '--card-background',
                text:       '--text-color',
                text_light: '--text-light',
                border:     '--border-color',
                accent:     '--hover-color',
                radius:     '--border-radius'
            };
            for (const [yamlKey, cssVar] of Object.entries(map)) {
                if (customOverrides[yamlKey]) {
                    lightVars[cssVar] = customOverrides[yamlKey];
                }
                if (customOverrides[`dark_${yamlKey}`]) {
                    darkVars[cssVar] = customOverrides[`dark_${yamlKey}`];
                }
            }
        }

        // Inject/update <style> element
        if (!this._styleEl) {
            this._styleEl = document.createElement('style');
            this._styleEl.id = 'theme-plugin-styles';
            document.head.appendChild(this._styleEl);
        }

        let css = '';
        if (Object.keys(lightVars).length) {
            css += ':root {\n';
            for (const [k, v] of Object.entries(lightVars)) css += `  ${k}: ${v};\n`;
            css += '}\n';
        }
        if (Object.keys(darkVars).length) {
            css += '[data-theme="dark"] {\n';
            for (const [k, v] of Object.entries(darkVars)) css += `  ${k}: ${v};\n`;
            css += '}\n';
        }

        this._styleEl.textContent = css;

        // Update meta theme-color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            meta.content = isDark
                ? (darkVars['--background-color'] || '#0f1419')
                : (lightVars['--background-color'] || '#f7f8fa');
        }

        // Persist choice
        localStorage.setItem('portal_theme', themeName);

        console.log(`[Themes] Applied: ${themeName}`);
    },

    getCurrent() {
        return this._currentName;
    },

    getThemes() {
        return BUILT_IN_THEMES;
    }
};

// ---- Theme Picker UI --------------------------------------------------------

function createThemePicker() {
    // Remove old picker
    document.getElementById('theme-picker-btn')?.remove();

    const btn = document.createElement('button');
    btn.id = 'theme-picker-btn';
    btn.className = 'theme-picker-btn';
    btn.setAttribute('aria-label', 'Theme wählen');
    btn.title = 'Theme wählen';
    btn.innerHTML = '🎨';
    btn.onclick = (e) => {
        e.stopPropagation();
        toggleThemeDropdown();
    };

    // Insert before admin button if it exists, otherwise append
    const headerRight = document.querySelector('.header-right');
    const adminBtn = document.getElementById('admin-toggle-btn');
    if (adminBtn) {
        headerRight.insertBefore(btn, adminBtn);
    } else {
        headerRight.appendChild(btn);
    }
}

function toggleThemeDropdown() {
    const existing = document.getElementById('theme-dropdown');
    if (existing) { existing.remove(); return; }

    const dropdown = document.createElement('div');
    dropdown.id = 'theme-dropdown';
    dropdown.className = 'theme-dropdown';

    const themes = ThemeEngine.getThemes();
    const current = ThemeEngine.getCurrent();

    for (const [name, theme] of Object.entries(themes)) {
        const item = document.createElement('button');
        item.className = `theme-dropdown-item${name === current ? ' active' : ''}`;
        item.textContent = theme.label;
        item.onclick = () => {
            ThemeEngine.apply(name, globalConfig?.theme?.custom);
            dropdown.remove();
            Toast.show(`Theme: ${theme.label}`, 'success', 1500);
        };
        dropdown.appendChild(item);
    }

    // Position relative to button
    const btn = document.getElementById('theme-picker-btn');
    const rect = btn.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + 6) + 'px';
    dropdown.style.right = (window.innerWidth - rect.right) + 'px';

    document.body.appendChild(dropdown);

    // Close on outside click
    const closeHandler = (e) => {
        if (!dropdown.contains(e.target) && e.target !== btn) {
            dropdown.remove();
            document.removeEventListener('click', closeHandler);
        }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 10);
}

// ---- Register as Plugin -----------------------------------------------------

PluginManager.register('themes', {
    init(config) {
        // Determine theme: saved preference > config > default
        const saved = localStorage.getItem('portal_theme');
        const configName = config?.theme?.name || 'default';
        const themeName = saved || configName;
        const customOverrides = config?.theme?.custom || null;

        ThemeEngine.apply(themeName, customOverrides);
        createThemePicker();
    },

    destroy() {
        document.getElementById('theme-picker-btn')?.remove();
        document.getElementById('theme-dropdown')?.remove();
        const styleEl = document.getElementById('theme-plugin-styles');
        if (styleEl) styleEl.remove();
    },

    adminTab: {
        label: '🎨 Themes',
        render(container) {
            const themes = ThemeEngine.getThemes();
            const current = ThemeEngine.getCurrent();

            let html = `<div class="admin-section"><h3>Aktives Theme</h3>
                <p style="font-size:1.1rem;font-weight:600;margin-bottom:16px">${themes[current]?.label || current}</p>
            </div>`;

            html += `<div class="admin-section"><h3>Verfügbare Themes</h3>
                <div class="theme-grid">`;

            for (const [name, theme] of Object.entries(themes)) {
                const isActive = name === current;
                const lightBg = theme.light?.['--background-color'] || '#f7f8fa';
                const lightCard = theme.light?.['--card-background'] || '#ffffff';
                const lightAccent = theme.light?.['--hover-color'] || '#2b6cb0';
                const lightText = theme.light?.['--text-color'] || '#1a1a2e';
                const darkBg = theme.dark?.['--background-color'] || '#0f1419';

                html += `<button class="theme-preview${isActive ? ' theme-preview-active' : ''}"
                    data-theme-name="${name}" title="${theme.label}">
                    <div class="theme-preview-colors">
                        <span style="background:${lightBg}"></span>
                        <span style="background:${lightCard}"></span>
                        <span style="background:${lightAccent}"></span>
                        <span style="background:${darkBg}"></span>
                    </div>
                    <span class="theme-preview-label">${theme.label}</span>
                </button>`;
            }

            html += `</div></div>`;

            html += `<div class="admin-section"><h3>YAML Konfiguration</h3>
                <p class="admin-hint">Setze ein Theme in <code>links.yaml</code>:</p>
                <pre class="admin-config-pre">theme:
  name: "${current}"
  custom:              # optional
    primary: "#1a1a2e"
    accent: "#2b6cb0"
    background: "#f7f8fa"
    dark_background: "#0f1419"</pre>
            </div>`;

            html += `<div class="admin-section">
                <button class="admin-btn" id="admin-reset-theme">Auf Standard zurücksetzen</button>
            </div>`;

            container.innerHTML = html;

            // Wire theme selection buttons
            container.querySelectorAll('.theme-preview').forEach(btn => {
                btn.addEventListener('click', () => {
                    const name = btn.dataset.themeName;
                    ThemeEngine.apply(name, globalConfig?.theme?.custom);
                    Toast.show(`Theme: ${themes[name]?.label}`, 'success', 1500);
                    // Re-render to update active state
                    this.render(container);
                });
            });

            container.querySelector('#admin-reset-theme')?.addEventListener('click', () => {
                localStorage.removeItem('portal_theme');
                ThemeEngine.apply('default');
                Toast.show('Theme zurückgesetzt', 'info', 2000);
                this.render(container);
            });
        }
    }
});
