# TODO – vmcv-portal

- [x] Kontaktformular fuer falsche/fehlende Eintraege inkl. Bot-Schutz eingebaut (UI, Validierung, mailto-Flow)
- [x] In `config/links.yaml` `contact_email` auf produktive Empfaengeradresse setzen
- [x] Analytics in `config/links.yaml` aktiviert (`features.analytics_enabled: true`)
- [x] Sichtbaren Header-Link „Eintrag melden“ zum Kontaktformular hinzugefuegt
- [x] Gelöschte `config/.backups/links_2026-01-05_*.yaml` aus Repo entfernt (Ordner steht in .gitignore) — erledigt 2026-10-25: committet
- [x] Compose-Änderungen committen (Container-Rename, Alias) — erledigt 2026-10-25: committet
- [ ] NPM-Forward auf `vmcv-portal:80` umstellen, dann Alias `portal-page` entfernen
- [ ] v2: Keycloak-Login statt eigenem Admin-Login (siehe vmcv-admin/docs/BENUTZERVERWALTUNG.md)
- [x] Formular-Aenderungen committen — erledigt 2026-10-25: committet
- [ ] Meldeformular einmal echt absenden, Eingang beim Empfaenger pruefen
- [ ] Vor Produktivbetrieb: `no-store` in nginx.conf durch Caching fuer Bilder/Fonts ersetzen
- [ ] `public/service-worker.js` (Selbstzerstoerer) fruehestens 2027 loeschen, wenn keine alten Registrierungen mehr aktiv
