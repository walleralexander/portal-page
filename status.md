# Status – vmcv-portal

## Recap 2026-10-26 (6)
- Couleur-Icons nutzen die Farbpalette des Verbindungsverzeichnisses (/workspace/vmcv-alleverbindungen): `tools/farbpalette.js` -> `public/farbpalette.json` (39 Farben, Hex). Alle 33 Couleur-Icons in links.yaml auf `farben.burschen` des Verzeichnisses umgestellt (Zuordnung ueber Website bzw. id). Abweichungen zu vorher u. a. Bregancea (weiss-schwarz-blau-weiss), Sonnenberg (blau), Bernardia (purpurrot), Raeto-Bavaria (hochrot).
- Icons mit duennem Rand, damit weisse Streifen sichtbar sind.
- Verzeichnis NICHT geaendert: babenberg.org ist bis 2027 registriert, nur der Server antwortet nicht (Ausfall, keine Datenkorrektur). Augo Nibelungia fehlt im Verzeichnis. Beides als Todo im Verzeichnis-Repo.

## Recap 2026-10-26 (5)
- Neue Kategorie „Hochschulverbindungen Innsbruck“: die 6 ÖCV-Verbindungen, die der ICV verlinkt (Alpinia, Austria, Leopoldina, Raeto-Bavaria, Rheno-Danubia, Vindelicia). „Hochschulverbindungen“ neu: Alpenland Wien, Carolina Graz, Kürnberg Wien, Lodronia Salzburg, Rugia Wien. Daten aus Artefakt „Verbindungen nach Verbänden“, Websites geprueft.
- Couleur-Icons koennen jetzt 2-4 Streifen (Lodronia silber-blau, Rheno-Danubia weiss-gold-blau-weiss).
- Nachtrag: Innsbruck um alle katholischen Hochschulverbindungen erweitert (ÖKV Tirolia/Rhenania, KÖL Theresiana/Ostaricia, Curia Claudiana, VCS Stella Vindelicia, A.V. Aurora) = 13. K.H.V. Babenberg Wien ergaenzt (Link ÖCV-Profilseite, eigene Website tot). Leopoldina-Icon blau-gruen-gold. Linkcheck 72 Links.
- Linkcheck fand 13:51 echten Ausfall: www.vmcv.at „500 Internal Server Error“ (Hosting meinweb, 162.55.244.162).

## Recap 2026-10-26 (4)
- Siegbergball-Link entfernt. SLV (WordPress-Fehler) und STMV (kein DNS) bleiben mit rotem Punkt (Entscheidung EB Ericsson); mkv.at/organisation verlinkt beide auch nicht. A.V. Austria: Zertifikat abgelaufen, Verbindung informiert.
- Linkcheck erkennt „weiche“ Ausfaelle: Status 200, aber kurze Seite (<400 Zeichen) mit offline/Wartung/maintenance/... -> rot mit Grund im Popup („Seite meldet ‚offline‘“). Anlass ogv.mkv.at. An allen 55 Links getestet: kein Fehlalarm.

## Recap 2026-10-26 (3)
- Info-Popup je Link-Kachel (ⓘ, PC beim Darueberfahren, Handy immer sichtbar; native <dialog>): Adresse, Status, „Neu“, Button „Problem mit diesem Link melden“ -> `melden.html?link=&url=` (vorausgefuellt).
- Meldeformular auf eigene Seite `melden.html` + `report.js` ausgelagert. Header-Link dorthin; am Handy (<480px) Header-Link ausgeblendet (Header zu breit), dafuer im Footer.
- Linkcheck: Container `vmcv-portal-linkcheck` (php-fpm-Image, Schleife stuendlich) -> `data/status.json`. Roter Punkt bei nicht erreichbar. „Neu“ ueber Hash des sichtbaren Texts ohne Ziffern, Bestaetigung ueber 2 Laeufe, Lernphase 7 Tage, unterdrueckt bei >3 Aenderungen/Woche.
- Messungen: Roh-Hash 29/52 Fehlalarme, Last-Modified unbrauchbar, Text-Hash 0/52 sofort; nach 20 Min. 5/53 Rauschen (Facebook x3, bregancea Bildunterschrift, cloud.vmcv.at) -> Lernphase + Wechsel-Erkennung.
- Stolpersteine: Container ohne IPv6 (bindto 0.0.0.0), Host-DNS loest server.vmcv.at auf 127.0.1.1 (Container nutzt 1.1.1.1/9.9.9.9).
- Derzeit nicht erreichbar: siegbergball-2026.lovable.app (404), slv-mkv.at (500), stmv.at (DNS weg), av-austria.at (Verbindung scheitert).
- Fixes nebenbei: Handy-Ueberbreite (lange Woerter in Kacheln), lang="de" + Silbentrennung.
- Getestet mit Headless-Chrome (Playwright): PC + Handy, Popup, Vorbefuellung, Suche, „Neu“ (mit vorgespieltem status.json), keine JS-Fehler.
- Naechster Schritt: ab 2026-11-02 pruefen, ob „Neu“ sinnvoll anschlaegt.

## Recap 2026-10-26 (2)
- EB Ericsson bestaetigt: Meldeformular-Mail kommt an, Umami-Events „Link-Klick“ kommen an.
- ZVR-Zahl 069488907 im Impressum ergaenzt.
- NPM proxy_host 6 (portal.vmcv.at, portal.server.vmcv.at) zeigt jetzt auf `vmcv-portal:80`, Alias `portal-page` entfernt. Backup `/stacks/npm/data/database.sqlite.bak-20261026-123633`.
- Nach GitHub gepusht.
- Offen: Caching fuer Bilder vor Produktivbetrieb (todo). Naechste Aenderungen folgen.

## Recap 2026-10-26
- Lokale Klick-/Suchstatistik komplett entfernt (analytics.js, Admin-Tab „Statistik“, Suchtracking, Flag in links.yaml, totes CSS). app.js loescht Altdaten `portal_analytics` aus den Browsern.
- Ersatz: Umami zaehlt Link-Klicks zentral (`data-umami-event="Link-Klick"`, Property `link` = Titel). Datenschutz-Text angepasst.
- Impressum: Verweis auf vmcv.at/impressum entfernt (dort alt/widerspruechlich) -> VMCV-Todos #vmcv-1 Impressum vmcv.at erneuern, #vmcv-2 App-Impressum nicht auf vmcv.at verweisen.
- Naechster Schritt: in Umami pruefen, ob Events „Link-Klick“ ankommen.

## Recap 2026-10-25 (14)
- `public/impressum.html` (Impressum + Datenschutz, Footer-Link auf Startseite). Angaben wie vmcv-app-2026/config/legal.php (VMCV, Bundesstrasse 69a Lauterach, lvv@vmcv.at, Alexander Waller).
- Rechtsrahmen AT: Pflicht Offenlegung § 25 MedienG (kleine Website: Name + Sitz), § 5 ECG vorsorglich, Datenschutzerklaerung wegen Formular, Server-Logs, Umami. Kein Cookie-Banner noetig (keine Cookies).
- js-yaml selbst gehostet (`public/vendor/`), jsdelivr aus HTML und CSP entfernt -> kein Drittanbieter mehr.
- Offen: lokale Klick-/Suchstatistik (analytics.js) - Nutzen fraglich, Einwilligungsfrage § 165 TKG. Entscheidung Alex.

## Recap 2026-10-25 (13)
- Alex bestaetigt: Seite jetzt aktuell (SW-Selbstzerstoerer hat gewirkt).
- Erste echte Meldung 22:37 UTC: /api/report 200, mailrelay -> mailserver.meinweb.at "250 queued as 8DD412560A62". Eingang im Postfach noch zu bestaetigen.

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
- Projekt von `/stacks/portal-page` nach `/workspace/vmcv-portal` verschoben (Eigenentwicklung).
- `name: portal-page` in docker-compose.yml gesetzt → Container-/Image-Name unverändert.
- Container neu erstellt, healthy, https://portal.vmcv.at → 200.
- Nächster Schritt: offene git-Änderungen committen (siehe todo.md).
- Repo: github.com/walleralexander/portal-page
