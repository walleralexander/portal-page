# Portal Page - Enhanced Edition

A highly configurable portal/start page with advanced features including search, keyboard shortcuts, RSS feed integration, and comprehensive dark mode support.

## ✨ Features

### Core Features
- **YAML Configuration** - Easy configuration via `config/links.yaml`
- **Dark Mode** - Toggle with system preference detection
- **RSS Feed Integration** - Display latest news from any RSS feed
- **Custom Icons** - 40+ built-in icons including country flags
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Docker Ready** - Deploy with Docker Compose

### Enhanced Features ⭐
- **🔍 Live Search** - Search through all links with `Ctrl+K`
- **⌨️ Keyboard Shortcuts** - Power user friendly navigation
- **🎨 Enhanced Animations** - Smooth transitions and hover effects
- **📊 Performance Optimized** - Caching and lazy loading
- **♿ Accessibility** - Screen reader and keyboard navigation support
- **🔧 Environment Configuration** - Easy deployment customization

## 🚀 Quick Start

### Automated Setup (Recommended)
```bash
git clone https://github.com/yourusername/portal-page.git
cd portal-page
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### Local Development
```bash
# Serve static files
npx serve
# Open http://localhost:3000
```

#### Docker Deployment
```bash
# Basic setup
docker-compose up -d

# Enhanced setup with all features
docker-compose -f docker-compose.enhanced.yml up -d
```

## ⚙️ Configuration

### Basic Configuration
Edit `config/links.yaml` to customize your portal:

```yaml
site_name: "My Enhanced Portal"
logo: "https://example.com/logo.png"
favicon: "https://example.com/favicon.ico"
message: "Welcome! Use Ctrl+K to search, Ctrl+D for dark mode."

# Performance settings
cache_duration: 300
request_timeout: 10
max_retries: 3

# Features
features:
  search_enabled: true
  keyboard_shortcuts: true
  analytics_enabled: false

categories:
  - name: "Development"
    color: "#2D3748"
    links:
      - title: "GitHub"
        url: "https://github.com"
        icon: "external-link"
        description: "Code repositories"
```

### Environment Configuration
Copy `.env.example` to `.env` and customize:

```bash
PORT=80
DOMAIN=portal.yourdomain.com
ANALYTICS_ENABLED=false
CACHE_CONTROL_MAX_AGE=86400
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Focus search bar |
| `Ctrl+D` | Toggle dark/light mode |
| `Ctrl+R` | Refresh page |
| `Escape` | Clear search |

## 🎨 Available Icons

### General Icons
`home`, `cloud`, `image`, `globe`, `www`, `website`, `flag`, `search`, `calculator`, `code`, `help-circle`, `book`, `edit`, `terminal`, `message-square`, `play-circle`, `mail`, `calendar`, `file-text`, `clipboard`, `link`, `star`, `heart`, `settings`, `user`, `users`, `folder`, `download`, `upload`, `external-link`, `rss`, `database`, `server`, `shield`, `lock`, `unlock`, `key`, `bell`, `contact`

### Country Flags
`flag-at` (Austria), `flag-de` (Germany), `flag-ch` (Switzerland), `flag-eu` (EU)

### Austrian Bundesländer
`flag-wien`, `flag-noe`, `flag-ooe`, `flag-stmk`, `flag-ktn`, `flag-sbg`, `flag-tirol`, `flag-vbg`, `flag-bgld`

## 🐳 Docker Configuration

### Basic Docker Compose
```yaml
services:
  portal:
    build: .
    ports:
      - "80:80"
    volumes:
      - ./config:/data/config:ro
```

### Enhanced Docker Compose
```yaml
services:
  portal:
    build: .
    ports:
      - "${PORT:-80}:80"
    volumes:
      - ./config:/data/config:ro
      - ./custom.css:/usr/share/nginx/html/custom.css:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🔧 Advanced Features

### Search Functionality
The enhanced search feature allows you to quickly find links across all categories:
- Type to search through link titles
- Use `Ctrl+K` to quickly focus the search bar
- Categories automatically hide/show based on results

### RSS Feed Categories
Categories can display RSS feeds instead of static links:
```yaml
categories:
  - name: "Latest News"
    rss_feed: "https://example.com/feed.xml"
    rss_items: 5
    rss_icon: "rss"
    rss_description: "Latest updates"
```

### Custom Styling
Add custom CSS by mounting a file to `/usr/share/nginx/html/custom.css`:
```css
:root {
  --custom-accent: #FF6B6B;
}
.link-card:hover {
  border-color: var(--custom-accent);
}
```

## 📊 Performance Tips

1. **Enable Caching**: Set appropriate cache durations for RSS feeds
2. **Optimize Images**: Use compressed logos and favicons
3. **Bundle Assets**: Consider using a build process for production
4. **Monitor RSS Feeds**: Ensure RSS sources are reliable and fast

## 🔒 Security

### Content Security Policy
The enhanced nginx configuration includes security headers:
- CSP headers to prevent XSS attacks
- HSTS headers for HTTPS deployments
- X-Frame-Options to prevent clickjacking

### Environment Variables
Sensitive configuration should use environment variables:
```bash
ANALYTICS_SECRET=your-secret-key
DATABASE_URL=your-database-url
```

## 🚀 Deployment Options

### Simple Deployment
```bash
docker-compose up -d
```

### Production Deployment with SSL
```bash
# Using Traefik for SSL termination
docker-compose -f docker-compose.enhanced.yml up -d
```

### Cloud Deployment
The portal works great with:
- **Docker Swarm**: Use `docker stack deploy`
- **Kubernetes**: Convert compose file with kompose
- **Cloud Run**: Deploy as a container
- **Netlify/Vercel**: Deploy static files

## 🛠️ Development

### Project Structure
```
portal-page/
├── index.html              # Main HTML file
├── app.js                  # Core JavaScript
├── styles.css              # Core CSS
├── enhancements.css        # Enhanced features CSS
├── keyboard-shortcuts.js   # Keyboard functionality
├── search-feature.js       # Search functionality
├── config/
│   └── links.yaml         # Configuration
├── docker-compose.yml     # Basic Docker setup
└── docker-compose.enhanced.yml # Advanced Docker setup
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 Changelog

### Enhanced Edition
- ✅ Added live search functionality
- ✅ Added keyboard shortcuts
- ✅ Enhanced animations and hover effects
- ✅ Improved accessibility
- ✅ Added environment configuration
- ✅ Added health checks
- ✅ Performance optimizations

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Support

- 📖 **Documentation**: Check this README and example configs
- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Open an issue with enhancement label
- 💬 **Discussions**: Use GitHub Discussions for questions

---

Made with ❤️ for developers who love organized bookmarks and beautiful interfaces.