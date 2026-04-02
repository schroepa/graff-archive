# ROADMAP – Graff Archive

Stand: April 2026

---

## ✅ Sprint 0 – Fundament (abgeschlossen)

- [x] Docker Compose: Directus 11 + PostgreSQL
- [x] Directus Collections-Schema: photos, writers, crews, style_tags
- [x] Next.js 15 (App Router, TypeScript, Tailwind)
- [x] Directus SDK Client + TypeScript-Typen
- [x] Image Pipeline: EXIF-Strip + WebP-Konvertierung (Sharp)
- [x] Feed: chronologischer Archiv-Feed, kein Algorithmus
- [x] Upload-Form mit Counter-Forensics-Hinweisen
- [x] Writer-Profil `/writer/[tag]`
- [x] Crew-Seite `/crew/[name]`
- [x] Foto-Detailseite `/photo/[id]`
- [x] Burner-System: anonym, 1x pro Browser, Flame-Animation
- [x] Seed-Script mit synthetischen Beispieldaten
- [x] Dark Design-System (monospace, archivisch, anti-Instagram)

---

## 🔄 Sprint 1 – User-System (geplant)

### Konzept: Pseudonyme Verifikation via Proof-of-Handstyle

Kein Name. Keine E-Mail. Kein OAuth. Identität = Tag + Recovery-Phrase.

**Verifikationsflow:**
1. Writer wählt Tag (unique)
2. System generiert Challenge-Code (`SF-XXXX`)
3. Writer fotografiert Handstyle mit Challenge-Code → einreichen
4. Admin sichtet Foto in Directus → `verified: true` setzen
5. Handstyle-Foto wird nach Verifikation kryptografisch überschrieben (`crypto.randomBytes`)
6. Writer erhält Recovery-Phrase (16 Hex-Zeichen, nur einmal angezeigt, nie serverseitig im Klartext)

**Login:**
- Via Recovery-Phrase → bcrypt-Vergleich → Session-Token (JWT, nur localStorage)
- Kein Server-Session-Store, kein Cookie
- Kein Reset-Flow → verlorene Phrase = verlorener Account

**Neue Collections:**
- `sf_users`: `tag` (unique), `password_hash` (bcrypt), `verified`, `challenge_code`, `created_week_hash` (kein exaktes Datum)
- `sf_sessions`: Token-Hash, Ablaufdatum

**Neue Routen:**
- `/register` – Registrierungsflow (Step 1: Tag, Step 2: Challenge, Step 3: Handstyle-Upload)
- `/login` – Recovery-Phrase Eingabe
- `/account` – Eigene Werke verwalten, Profil-Felder editieren

**Artist-Rechte nach Verifikation:**
- Eigene Fotos: approve / reject / löschen
- Kommentare hinterlassen (als Tag, nicht als Klarname)
- Profil-Felder selbst bearbeiten (Bio, aktive Jahre, Origin)

---

## 🔄 Sprint 2 – Soziale Features (geplant)

### Kommentare
- Collection: `comments` (photo_id, author_tag_hash, content, created_at)
- Autor wird als Hash des Tags gespeichert, kein Fremdschlüssel
- Nur verifizierte Writer können kommentieren
- Keine Likes auf Kommentare
- Keine Antworten (flat, archivisch)

### Artist Homepage (überarbeitet)
- Masonry-Layout für Werke
- Stats: Gesamte Burner, Werke-Anzahl, aktiv seit (Jahr, kein Datum)
- Selbst editierbare Felder (bio, origin, active years)
- Verifikations-Badge
- Eigene Werke moderieren (inline)

### Crew Homepage (überarbeitet)
- Alle Crew-Mitglieder (verlinkt)
- Aggregierte Crew-Stats (Burner, Werke)
- Editierbar durch alle Crew-Mitglieder
- Kommentieren nur als eigener Tag, nie als Crew

---

## 🔄 Sprint 3 – Landing & Infrastruktur (geplant)

### Startseite
- Projekt-Statement (aus Whitepaper)
- Live-Archiv-Stats (Werke, Writer, Länder)
- Featured Werke (kuratiert, kein Algorithmus)
- CTA: Archiv / Zugang beantragen

### Warrant Canary
- `/canary` – öffentliche Seite, wöchentlich manuell aktualisiert
- Wenn veraltet: impliziertes Signal über Behördenanfragen

### Rate-Limiting
- `POST /api/burner/*`: max 10/min pro IP
- `POST /api/upload`: max 5/h pro IP
- Middleware-basiert, kein externes Service

---

## 🔄 Sprint 4 – Security Hardening (geplant)

- [ ] Content Security Policy Headers
- [ ] IP-Logging in Nginx/Caddy deaktivieren (Dokumentation + Config)
- [ ] Handstyle-Foto: sicheres Überschreiben nach Verifikation
- [ ] Tor Hidden Service: `.onion`-Konfigurationsanleitung
- [ ] Jurisdiction-Empfehlung dokumentieren (Island / Niederlande / Schweiz)
- [ ] Governance-Dokument: Wer entscheidet was

---

## Offene Fragen

- **Admin-Bootstrap**: Erster Admin-Account via direktem DB-Eintrag oder separatem Setup-Script?
- **Vouching als Phase-2-Alternative**: Sobald genug verifizierte Mitglieder → Peer-Verifikation als alternativer Registrierungspfad
- **Tor-First vs. Clearnet-First**: Soll die `.onion`-Adresse die primäre Adresse sein?
- **Kommentar-Moderation**: Wer kann Kommentare löschen? Nur der Autor selbst, oder auch Crew-Moderatoren?
