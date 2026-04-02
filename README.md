# GRAFF ARCHIVE

**Autonomes digitales Archiv der Writing-Kultur.**

Kein Social Network. Kein Like-Algorithmus. Keine Datenmonetarisierung.
Ein digitaler Rückzugsort für eine Kultur, die sich der ästhetischen Regulierung entzieht.

---

## Hintergrund

Die Schließung von Streetfiles.org im Mai 2013 markierte das Ende einer Ära. Mit ca. 25.000 Nutzern und 500.000 gehosteten Bildern war die Plattform das zentrale Gedächtnis der globalen Writing-Kultur. Ihr Scheitern war das Ergebnis technologischer Unterlegenheit gegenüber der globalen Infrastruktur von Instagram.

Dieses Projekt ist die Antwort darauf: archivarische Autonomie im digitalen Raum.

---

## Stack

| Layer | Technologie |
|-------|-------------|
| Backend / CMS | [Directus 11](https://directus.io) + PostgreSQL |
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Image Pipeline | Sharp (EXIF-Strip + WebP-Konvertierung) |
| Storage | Lokales Filesystem (erweiterbar auf S3) |
| Deployment | Docker Compose |

---

## Prinzipien

### Counter-Forensics by Default
EXIF-Daten (GPS, Kamera, Zeitstempel) werden **vor der ersten Persistierung** entfernt – nicht nachträglich. Kein GPS-Feld in der Datenbank. Keine IP-Logs.

### Anti-Like-Ökonomie
Keine algorithmische Gewichtung. Keine Follower-Zahlen. Der Feed ist chronologisch.
Das einzige Interaktionselement ist der **Burner** – ein anonymes, einmaliges Zeichen der Anerkennung.

### Pseudonymität statt Klarname
Identität im System = Tag + Crew. Kein Klarname, keine E-Mail, kein OAuth-Provider.

### Lean Infrastructure
WebP-Kompression, Server Components, minimaler JS-Footprint im Browser.
Keine CDN-Abhängigkeit. Keine Cloud-Lock-ins.

---

## Schnellstart

```bash
# 1. Repository klonen
git clone https://github.com/schroepa/graff-archive.git
cd graff-archive

# 2. Umgebungsvariablen setzen
cp .env.example .env
# .env öffnen und Werte anpassen

# 3. Backend starten
docker compose up -d

# 4. Auf Directus warten (~15s), dann Schema importieren
curl -s -X POST "$(grep DIRECTUS_PUBLIC_URL .env | cut -d= -f2)/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$(grep ADMIN_EMAIL .env | cut -d= -f2)\",\"password\":\"$(grep ADMIN_PASSWORD .env | cut -d= -f2)\"}"
# → Access Token aus Response kopieren

# Schema-Diff und Apply:
curl -s -X POST "http://localhost:8056/schema/diff?force=true" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d @directus/schema/snapshot.json | \
curl -s -X POST "http://localhost:8056/schema/apply" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d @-

# 5. Frontend
cd frontend
cp ../.env.example .env.local
# .env.local: DIRECTUS_TOKEN eintragen (Static Token aus Directus Admin)
npm install
npm run dev

# 6. Beispieldaten laden (optional)
npm run seed
```

Frontend: http://localhost:3000
Directus Admin: http://localhost:8056
Admin-Login: `admin@example.com` / `changeme` ← **in Produktion ändern**

---

## Projektstruktur

```
graff-archive/
├── docker-compose.yml          # Directus 11 + PostgreSQL
├── .env.example                # Umgebungsvariablen-Vorlage
├── directus/
│   └── schema/
│       └── snapshot.json       # Collections-Schema (versioniert)
├── frontend/                   # Next.js 15 App
│   ├── app/
│   │   ├── page.tsx            # Archiv-Feed (chronologisch)
│   │   ├── photo/[id]/         # Foto-Detailseite
│   │   ├── writer/[tag]/       # Writer-Profil + Werke
│   │   ├── crew/[name]/        # Crew-Seite
│   │   ├── upload/             # Upload-Form
│   │   └── api/
│   │       ├── upload/         # Image Pipeline (EXIF-Strip + WebP)
│   │       └── burner/[id]/    # Burner-Like Endpoint
│   ├── components/
│   │   ├── NavigationBar.tsx
│   │   ├── PhotoCard.tsx
│   │   ├── PhotoGrid.tsx
│   │   ├── UploadForm.tsx
│   │   ├── BurnerButton.tsx
│   │   └── FlameIcon.tsx
│   ├── lib/
│   │   ├── directus.ts         # Directus SDK Client + Queries
│   │   ├── image.ts            # Sharp Pipeline
│   │   └── utils.ts
│   ├── types/
│   │   └── directus.ts         # TypeScript-Typen + Type Guards
│   └── scripts/
│       └── seed.ts             # Beispieldaten (idempotent)
├── docs/
│   ├── ROADMAP.md              # Entwicklungsplan
│   ├── SECURITY.md             # Sicherheitskonzept
│   └── WHITEPAPER.md           # Kulturpolitisches Fundament
└── README.md
```

---

## Directus Collections

| Collection | Beschreibung |
|------------|--------------|
| `photos` | Archivierte Werke (WebP, kein EXIF) |
| `writers` | Writer-Profile (pseudonym) |
| `crews` | Crew-Profile |
| `style_tags` | Style-Klassifikationen |
| `photos_style_tags` | M2M Junction |

### Foto-Felder (Auswahl)
- `moderation_status`: `pending` → `approved` / `rejected`
- `location_city`, `location_country`: Freitext, **keine GPS-Koordinaten**
- `burner_count`: Aggregierter Burner-Zähler (anonym)
- `flagged`: Von Nutzern gemeldet
- `is_legal_wall`: Kontextualisierung

---

## Image Pipeline

```
Upload → EXIF-Strip (Sharp) → WebP (quality 85) → Directus Storage
                ↑
    Kein .withMetadata() = keine Metadaten in der Ausgabedatei
    .rotate() liest EXIF-Orientierung VOR dem Strip aus
```

---

## Burner-System

- Anonym, via `localStorage` (`sf_burners`)
- Max. 1 Burner pro Foto pro Browser
- Kein Account erforderlich
- Flame-Animation via `motion/react`
- API: `POST /api/burner/[id]`

---

## Lizenz

Kein kommerzieller Einsatz. Kein Ausverkauf.
Code: MIT – aber der Geist des Projekts ist nicht lizenzierbar.
