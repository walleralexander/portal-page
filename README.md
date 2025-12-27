# Portal Page

A configurable portal/start page with links organized by categories, RSS feed integration, and dark mode support.

## Features

- **YAML Configuration** - Easy configuration via `config/links.yaml`
- **Dark Mode** - Toggle with system preference detection
- **RSS Feed** - Display latest news from any RSS feed
- **Custom Icons** - 40+ built-in icons including country flags
- **Responsive Design** - Works on desktop and mobile
- **Docker Ready** - Deploy with Docker Compose

## Quick Start

### Local Development

```bash
npx serve
```

Open http://localhost:3000

### Docker

```bash
docker-compose up -d
```

Open http://localhost

## Configuration

Edit `config/links.yaml` to customize your portal:

```yaml
# Site settings
site_name: "My Portal"
logo: "https://example.com/logo.png"
favicon: "https://example.com/favicon.ico"
message: "Welcome to my portal!"

# RSS Feed (sidebar)
rss_feed: "https://example.com/feed.xml"
rss_items: 5

# Link categories
categories:
  - name: "Work"
    links:
      - title: "Email"
        url: "https://mail.example.com"
        icon: "mail"
      - title: "Calendar"
        url: "https://calendar.example.com"
        icon: "calendar"

  - name: "News"
    rss_feed: "https://news.example.com/rss"
    rss_items: 5
    rss_icon: "rss"
```

## Available Icons

### General
`home`, `cloud`, `image`, `globe`, `www`, `website`, `flag`, `search`, `calculator`, `code`, `help-circle`, `book`, `edit`, `terminal`, `message-square`, `play-circle`, `mail`, `calendar`, `file-text`, `clipboard`, `link`, `star`, `heart`, `settings`, `user`, `users`, `folder`, `download`, `upload`, `external-link`, `rss`, `database`, `server`, `shield`, `lock`, `unlock`, `key`, `bell`, `contact`

### Country Flags
`flag-at` (Austria), `flag-de` (Germany), `flag-ch` (Switzerland), `flag-eu` (EU)

### Austrian Bundeslaender
`flag-wien`, `flag-noe`, `flag-ooe`, `flag-stmk`, `flag-ktn`, `flag-sbg`, `flag-tirol`, `flag-vbg`, `flag-bgld`

## Docker Configuration

The `config/` directory is mounted as a volume, allowing you to edit `links.yaml` without rebuilding the container:

```yaml
volumes:
  - ./config:/data/config:ro
```

Changes to `links.yaml` take effect on page refresh.

## License

MIT
