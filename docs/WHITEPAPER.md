# Archivarische Autonomie im Digitalen Raum
## Der technologische Nachfolger von Streetfiles.org

---

## 1. Vision und das Erbe von Streetfiles.org

Die Schließung von Streetfiles.org im Mai 2013 markierte das Ende einer Ära, in der Graffiti und das Web eine „Killerkombi" bildeten. Mit ca. 25.000 Nutzern und 500.000 gehosteten Bildern war die Plattform das zentrale Gedächtnis der globalen Writing-Kultur. Ihr Scheitern war jedoch nicht nur ein Verlust von Community-Daten, sondern das Ergebnis einer technologischen Unterlegenheit gegenüber der globalen Infrastruktur von Instagram.

In der heutigen Ära der „Monopolisierung" (Bartelds) dient dieses Whitepaper als Entwurf für eine technische Intervention. Es geht nicht um die bloße Rekonstruktion eines Archivs, sondern um die Erlangung von Datensouveränität. Wir setzen ein System gegen die kommerziellen Verdrängungsmechanismen, das den subversiven Kern des Writings technologisch schützt und archivarisch autonom bleibt.

### Meilensteine und das Vermächtnis von Streetfiles

- **Kulturelle Datenbank**: Dokumentation von Style-Entwicklungen über sechs Jahre (2007–2013)
- **Archivische Lücke**: Der Verlust von 500.000 Bildquellen verdeutlichte die Gefahr zentralisierter, kommerzieller Datenspeicherung
- **Infrastruktur-Lehre**: Das Scheitern gegen Instagram bewies, dass eine subkulturelle Plattform technologisch agiler und unabhängiger von zentralen Cloud-Monopolen agieren muss
- **Fokus Datensouveränität**: Die neue Ära erfordert die Entkopplung von Inhalten und kommerziellen Verwertungsinteressen

---

## 2. Die kulturelle Krise: „Is this real?" vs. „Is this likeable?"

Die Migration der Szene zu Instagram hat die „ästhetische Regulierung" (Häuser) verschärft. Während das traditionelle Writing auf der „immanenten Illegalität" (Häuser) und der damit verbundenen physischen Präsenz basiert, erzwingen Algorithmen eine Ästhetik der Gefälligkeit.

| Metrik / Wert | Instagram | Traditionelles Writing |
|---------------|-----------|----------------------|
| Fokus | Quantität der Interaktionen | Qualität des Styles; Komplexität des Aktionsradius |
| Motivation | Digitale Belohnung durch Hype | Anerkennung durch die Peer-Group; physische Risikoerfahrung |
| Legitimation | Kult des Authentischen / Celebrity-Status | Risikoerfahrung / Geschärfte Sinne |
| Raum | Die Stadt als bloßes Trägermaterial für Content | Die Stadt als psychogeografisches Feld |
| Sichtbarkeit | Adressiert Konsumenten und Werbemärkte | Adressiert Gatekeeper und die Szene der Eingeweihten |

---

## 3. Die technische Lösung: Sovereign Stack und Counter-Forensics

### Directus (Decoupled Headless CMS)
Die vollständige Trennung von Datenbank (Archiv) und Frontend (App) verhindert, dass juristische Angriffe auf die Schnittstelle das gesamte Ökosystem kompromittieren.

### WebP-Infrastruktur (Performance & Lean Ops)
Minimierung der Serverlast durch hocheffiziente Kompression. Schnelle Auslieferung für den Einsatz im urbanen Raum.

### Metadata Stripping (Counter-Forensics)
Die automatisierte Entfernung von EXIF-Daten (GPS, Zeitstempel, Kameramodell) ist keine Komfortfunktion, sondern eine essenzielle Counter-Forensics-Maßnahme. Die Anonymität des Writers wird technisch erzwungen, bevor Daten das erste Mal persistent gespeichert werden.

---

## 4. KI-Moderation: Konzept für Phase 2

**Phase 1 (implementiert)**: Manuelle Moderation durch Admin über Directus-Interface.

**Phase 2 (geplant)**:
1. **Safety Gate** (automatisch, blockierend): NSFW, Hate Symbols, Gesichter – lokal via ONNX/transformers.js
2. **Subkultural Relevance Score** (asynchron, empfehlend): Score 0–100 via fine-tuned CLIP, beeinflusst nur Sortierung im Archiv
3. **Community-Flagging** (manuell): Flagging durch verifizierte Accounts, keine Likes

**Anmerkung zur Spannung**: Die Ablehnung von Algorithmen (Like-Ökonomie) und der Einsatz von KI zur Relevanzbewertung sind inhärent spannungsreich. Ein „subkultureller Algorithmus" ist immer noch ein Algorithmus. Diese Spannung wird bewusst offengehalten – der Score ist niemals hart filternder Mechanismus, sondern kuratorische Unterstützung.

---

## 5. Pseudonyme Verifikation

Das System löst das Problem der Anonymität vs. Qualitätssicherung durch **Proof-of-Handstyle**:

Ein Writer beweist sein Writing mit Writing. Der Handstyle mit einem einmaligen Challenge-Code ist der kulturell korrekte Identitätsnachweis – kein Name, kein Ausweis.

Das Beweisfoto wird nach Verifikation kryptografisch überschrieben. Was nicht existiert, kann nicht herausgegeben werden.

---

## 6. Nachhaltigkeit ohne Sellout

Das Scheitern von Streetfiles war auch eine ökonomische Lektion. Drei Prinzipien:

1. **Value-based Infrastructure**: Die Plattform operiert als digitales Gemeingut. Keine Datenmonetarisierung, keine Werbe-Algorithmen.
2. **Lean Infrastructure als Überlebensstrategie**: Durch moderne Kompression und dezentrale Hosting-Strukturen vermeiden wir die Serverkosten-Falle.
3. **Widerstand gegen die Sellout-Falle**: Der Erfolg bemisst sich an der Integrität des Archivs, nicht an der Skalierbarkeit für Werbepartner.

---

## 7. Manifest für digitale Sicherheit

- **Das Primat der Aktion**: Die App archiviert lediglich das Residuum einer physischen Tat.
- **Anonymität durch Architektur**: Wir sammeln keine Tracking-Daten.
- **Schutz des Weges**: Wir trennen das Ergebnis (das Piece) radikal vom Prozess (dem Weg).
- **Widerstand gegen die Like-Ökonomie**: Reputation entsteht durch Risiko, Präsenz und Stil.

> Dieses System ist kein soziales Netzwerk. Es ist ein digitaler Rückzugsort für eine Kultur, die sich der ästhetischen Regulierung entzieht.

---

## Offene konzeptuelle Fragen

1. **Governance**: Wer entscheidet, was „subkulturell relevant" ist? Ein Kernteam, eine Community oder ein Algorithmus?
2. **Rechtliche Grauzone**: Das Archivieren von Fotos illegaler Graffiti ist jurisdiktionsabhängig rechtlich komplex. Eine klare rechtliche Positionierungsstrategie fehlt noch.
3. **Anonymität vs. Pseudonymität**: Pseudonyme (Tags/Crews) sind trackbar, wenn genug Metadaten aggregiert werden. Echte Anonymität erfordert Zero-Knowledge-Ansätze.
