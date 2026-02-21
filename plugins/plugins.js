// =============================================================================
// Portal Page – Plugin System (Phase 4 Foundation)
// =============================================================================
//
// Plugins are optional modules loaded via config:
//
//   plugins:
//     - themes          # Built-in theme switcher (no backend)
//     - multi-user      # Requires backend (future)
//     - api             # Requires backend (future)
//
// Each plugin is a folder under /plugins/ containing:
//   - plugin.js    (required)  – must call PluginManager.register(...)
//   - plugin.css   (optional)  – auto-loaded
//
// Plugin JS must call:
//   PluginManager.register('name', { init, destroy, adminTab? })

const PluginManager = {
    _registered: {},     // name -> { init, destroy, adminTab }
    _loaded: new Set(),  // names of loaded plugins

    /** Called by each plugin script to register itself */
    register(name, plugin) {
        if (typeof plugin.init !== 'function') {
            console.error(`[Plugin] "${name}" has no init() function`);
            return;
        }
        this._registered[name] = plugin;
        console.log(`[Plugin] Registered: ${name}`);
    },

    /** Load plugins listed in config.plugins */
    async loadAll(pluginNames) {
        if (!pluginNames || !Array.isArray(pluginNames) || pluginNames.length === 0) {
            console.log('[Plugin] No plugins configured');
            return;
        }

        for (const name of pluginNames) {
            if (this._loaded.has(name)) continue;
            try {
                await this._loadPlugin(name);
                this._loaded.add(name);
            } catch (err) {
                console.error(`[Plugin] Failed to load "${name}":`, err);
                Toast.show(`Plugin "${name}" konnte nicht geladen werden`, 'error', 4000);
            }
        }
    },

    async _loadPlugin(name) {
        const basePath = `plugins/${name}`;

        // Load CSS (optional, ignore 404)
        try {
            const cssRes = await fetch(`${basePath}/plugin.css`, { method: 'HEAD' });
            if (cssRes.ok) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = `${basePath}/plugin.css`;
                link.dataset.plugin = name;
                document.head.appendChild(link);
                console.log(`[Plugin] Loaded CSS: ${name}`);
            }
        } catch {}

        // Load JS (required)
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${basePath}/plugin.js`;
            script.dataset.plugin = name;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${basePath}/plugin.js`));
            document.head.appendChild(script);
        });

        // Wait a tick for register() to be called, then init
        await new Promise(r => setTimeout(r, 50));

        const plugin = this._registered[name];
        if (!plugin) {
            throw new Error(`Plugin "${name}" loaded but did not call PluginManager.register()`);
        }

        // Init the plugin
        await plugin.init(globalConfig);
        console.log(`[Plugin] Initialised: ${name}`);

        // If plugin provides an admin tab, register it
        if (plugin.adminTab && typeof AdminPanel !== 'undefined') {
            AdminPanel._pluginTabs = AdminPanel._pluginTabs || [];
            AdminPanel._pluginTabs.push({ name, ...plugin.adminTab });
        }
    },

    /** Re-init all loaded plugins (called on hot-reload) */
    async reloadAll() {
        for (const name of this._loaded) {
            const plugin = this._registered[name];
            if (plugin?.destroy) {
                try { plugin.destroy(); } catch {}
            }
            if (plugin?.init) {
                try { await plugin.init(globalConfig); } catch (e) {
                    console.error(`[Plugin] Reload failed for "${name}":`, e);
                }
            }
        }
    },

    /** Get list of loaded plugin names */
    getLoaded() {
        return [...this._loaded];
    },

    /** Check if a plugin is loaded */
    isLoaded(name) {
        return this._loaded.has(name);
    }
};
