# Status – vmcv-portal

## Recap 2026-10-25 (12)
- PWA entfernt (Lehre aus /stacks/vmcv-cal/POSTMORTEM.md): `public/service-worker.js` ist nur noch Selbstzerstoerer (loescht Caches, meldet sich ab, laedt Tabs neu). index.html registriert keinen SW mehr und entfernt alte Registrierungen + Caches. offline.html und unbenutzte manifest.json geloescht.
- Selbstzerstoerer liegen lassen, bis keine alten Registrierungen mehr im Umlauf sind.

## Recap 2026-10-25 (11)
- Umbau wie vmcv-couleur-wiki: Web-Dateien nach `public/`, Compose `image: nginx:alpine` mit ro-Mounts (`public/`, `nginx.conf`, `config/`). Dockerfile + Build entfallen; Aenderungen in `public/` sind sofort live.
- Entwicklungsphase: nginx sendet fuer alles `Cache-Control: no-store` (Server-Ebene, Security-Header bleiben). Nur `nginx.conf`-Aenderungen brauchen `docker compose restart portal`.
- Geprueft: Testdatei in public/ sofort abrufbar; .git, report.env, api/*.php nicht abrufbar (Fallback index.html); /api/report antwortet.

## Recap 2026-10-25 (10)
- Nutzer sah alte Formular-Version (Rechenaufgabe, "Kontaktadresse fehlt"). Ursache: Service Worker cache-first fuer HTML/JS/CSS.
- SW jetzt network-first (Cache nur offline), `portal-v10`; beim Update laedt er offene Tabs einmal automatisch neu.
- Nachtrag: Nutzer sah weiter Alt-Stand, weil alte `immutable`-Dateien im HTTP-Cache lagen und auch SW-fetch sie nahm. SW holt jetzt mit `cache: 'no-cache'` (v11). Im echten Browser noch nicht bestaetigt (Playwright startet als root nicht).
- nginx: HTML/JS/CSS `expires -1` (no-cache). `add_header` in location vermieden, weil es die Security-Header verwirft (war beim JS/CSS-Fix passiert, jetzt behoben).

## Recap 2026-10-25 (9)
- Meldeformular auf serverseitigen Versand umgebaut: `api/report.php` im Container `vmcv-portal-php` (php:8.3-fpm-alpine), nginx `/api/report` -> fastcgi. Versand per SMTP ueber `mailrelay` (Absender lvs@vmcv.at), Reply-To = Melder.
- Empfaenger nur in `report.env` (gitignored, Vorlage `report.env.example`). `contact_email` aus links.yaml/JS entfernt -> Adresse nicht mehr oeffentlich.
- Bot-Schutz jetzt serverseitig: Honeypot, Mindestzeit 3 s, 3 Meldungen/IP/10 min. Rechenaufgabe und mailto/Zwischenablage entfernt. Fehler lassen Eingaben stehen.
- Getestet: Validierung live (405/400/Honeypot), SMTP-Pfad gegen mailpit (Mail korrekt). Echte Mail an Empfaenger noch nicht getestet.
- Achtung: `.env` ist im oeffentlichen Repo eingecheckt (nur Defaults, nichts Geheimes) - keine Geheimnisse dort ablegen.

## Recap 2026-10-25 (8)
- Empfaengeradresse aus Formular entfernt (nicht mehr sichtbar). Adresse auch aus status/todo entfernt, lokale Commits vor Push neu gebaut.
- Grenze: mailto braucht die Adresse im Browser, `/links.yaml` ist oeffentlich abrufbar. Ganz verbergen nur mit serverseitigem Versand.

## Recap 2026-10-25 (7)
- Fehler: Formular + Link „Eintrag melden" waren nicht online. Grund: Dateien per COPY ins Image gebacken, Container nie neu gebaut. Zusaetzlich SW cache-first (`portal-v6`) haette Stammnutzern alte Dateien geliefert.
- Fix: `CACHE_NAME` auf `portal-v7`, `docker compose up -d --build`. Live geprueft: index.html enthaelt Link + Formular, app.js `initReportForm`, `/links.yaml` liefert `contact_email`.
- Merke: jede Aenderung an HTML/JS/CSS braucht Rebuild + SW-Cache-Version hochzaehlen.
- Nachtrag: nginx lieferte JS/CSS mit `immutable`, 1 Tag Cache -> Browser lud neue Dateien nicht. JS/CSS jetzt `no-cache` (ETag), SW `portal-v8`.
- Alles committet (Repo = Original, immer live). Naechster Schritt: Formular im Browser durchklicken (mailto oeffnet?).

## Recap 2026-10-25 (6)
- Sichtbaren Header-Link `Eintrag melden` eingebaut, der direkt zum Kontaktformular springt.
- Smooth-Scroll und responsive Styling fuer mobile Nutzung ergaenzt.

## Recap 2026-10-25 (5)
- `features.analytics_enabled: true` in `config/links.yaml` gesetzt.
- Analytics-Funktionen im Frontend sind damit aktiv (inkl. Admin-Tab-Auswertung).

## Recap 2026-10-25 (4)
- `contact_email` in `config/links.yaml` gesetzt (Adresse nicht im Repo notieren, Repo ist oeffentlich).
- Kontaktformular ist damit aktiv und erzeugt Meldungen an diese Adresse.

## Recap 2026-10-25 (3)
- Kontaktformular fuer falsche/fehlende Eintraege eingebaut (unterhalb des Hauptinhalts).
- Bot-Schutz umgesetzt: Honeypot-Feld, Mindest-Ausfuellzeit und Rechenaufgabe plus einfaches clientseitiges Rate-Limit.
- Versand als `mailto:` mit vorausgefuelltem Inhalt; Zwischenablage-Fallback fuer den Meldungstext.
- Neue Konfiguration dokumentiert: `contact_email` in `config/links.yaml`.
- Naechster Schritt: produktive Empfaengeradresse in `config/links.yaml` setzen und kurz im Browser testen.

## Recap 2026-10-25 (2)
- Container umbenannt: `vmcv-portal` (Compose-Projekt = Ordnername). Netzwerk-Alias `portal-page` hält NPM-Forward gültig. Altes Image entfernt. portal.vmcv.at → 200.

## Recap 2026-10-25
- Projekt von `/stacks/portal-page` nach `/workplace/vmcv-portal` verschoben (Eigenentwicklung).
- `name: portal-page` in docker-compose.yml gesetzt → Container-/Image-Name unverändert.
- Container neu erstellt, healthy, https://portal.vmcv.at → 200.
- Nächster Schritt: offene git-Änderungen committen (siehe todo.md).
- Repo: github.com/walleralexander/portal-page
