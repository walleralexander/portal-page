# TODO – vmcv-portal

- [x] Kontaktformular fuer falsche/fehlende Eintraege inkl. Bot-Schutz eingebaut (UI, Validierung, mailto-Flow)
- [x] In `config/links.yaml` `contact_email` auf produktive Empfaengeradresse setzen
- [x] Analytics in `config/links.yaml` aktiviert (`features.analytics_enabled: true`)
- [x] Sichtbaren Header-Link „Eintrag melden“ zum Kontaktformular hinzugefuegt
- [x] Gelöschte `config/.backups/links_2026-01-05_*.yaml` aus Repo entfernt (Ordner steht in .gitignore) — erledigt 2026-10-25: committet
- [x] Compose-Änderungen committen (Container-Rename, Alias) — erledigt 2026-10-25: committet
- [x] NPM-Forward auf `vmcv-portal:80` umstellen, dann Alias `portal-page` entfernen — erledigt 2026-10-26: NPM proxy_host 6 umgestellt (DB + conf, Backup database.sqlite.bak-20261026-123633), Alias entfernt, portal.vmcv.at + portal.server.vmcv.at 200
- [ ] v2: Keycloak-Login statt eigenem Admin-Login (siehe vmcv-admin/docs/BENUTZERVERWALTUNG.md)
- [x] Formular-Aenderungen committen — erledigt 2026-10-25: committet
- [x] Eingang der Testmeldung (queued 8DD412560A62) im Empfaenger-Postfach bestaetigen — erledigt 2026-10-26: EB Ericsson bestaetigt
- [ ] Vor Produktivbetrieb: `no-store` in nginx.conf durch Caching fuer Bilder/Fonts ersetzen (nie `immutable` auf Dateinamen ohne Hash, HTML immer no-store)
- [ ] `public/service-worker.js` (Selbstzerstoerer) fruehestens 2027 loeschen, wenn keine alten Registrierungen mehr aktiv
- [x] Lokale Klick-/Suchstatistik entfernt, Umami-Klickzaehlung eingebaut — erledigt 2026-10-26: Alex entschieden, live geprueft (app.js data-umami-event)
- [x] ZVR-Zahl des VMCV ins Impressum — erledigt 2026-10-26: 069488907 eingetragen, live geprueft
- [x] In Umami pruefen, ob Events „Link-Klick“ ankommen — erledigt 2026-10-26: EB Ericsson bestaetigt
