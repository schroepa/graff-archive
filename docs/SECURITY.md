# SECURITY – Graff Archive

Dieses Dokument beschreibt das Sicherheits- und Datenschutzkonzept des Projekts.

---

## Grundprinzip: Was wir nicht haben, können wir nicht herausgeben

Jede Designentscheidung folgt diesem Axiom.

---

## Implementiert (Sprint 0)

### Counter-Forensics: EXIF-Strip
- Alle hochgeladenen Bilder werden via Sharp verarbeitet
- `.rotate()` liest die EXIF-Orientierung aus, bevor alle Metadaten entfernt werden
- Kein Aufruf von `.withMetadata()` → Sharp verwirft standardmäßig alle Metadaten
- **Kein GPS**, kein Kameramodell, kein Aufnahmedatum landet in der Datenbank
- Der Strip passiert **vor der ersten Persistierung**, nicht nachträglich

### Keine GPS-Felder
- Das Datenbankschema enthält nur `location_city` (Freitext) und `location_country`
- Keine Koordinatenfelder, keine PostGIS-Felder
- Selbst wenn ein Writer GPS-Daten eintippen würde: das System hat keinen Kartendienst

### Burner-Anonymität
- Burner werden via `localStorage` gezählt, serverseitig nur als Integer (`burner_count`)
- Kein Tracking, wer geburnert hat
- Kein IP-Logging beim Burner-Endpoint

---

## Geplant (Sprint 1–4)

### Pseudonyme Identität
- Kein Klarname, keine E-Mail, kein OAuth-Provider
- Identität = Tag (Pseudonym) + Recovery-Phrase
- Recovery-Phrase: 16 Hex-Zeichen, nur einmal im Browser angezeigt
- Serverseitig: nur bcrypt-Hash der Recovery-Phrase
- **Kein Reset-Flow** – verlorene Phrase = verlorener Account (verhindert Support-Angriffe)

### Proof-of-Handstyle
- Challenge-Code (`SF-XXXX`) wird einmalig generiert und ist ortsgebunden an den Account
- Handstyle-Foto wird nach Verifikation durch Admin **kryptografisch überschrieben**:
  ```ts
  // Nicht nur unlink() – Datei mit Zufallsbytes überschreiben vor dem Löschen
  await fs.writeFile(path, crypto.randomBytes(fileSize));
  await fs.unlink(path);
  ```
- Kein Beweisfoto bleibt im System

### Session-Management
- Session-Token: JWT, signiert mit `DIRECTUS_SECRET`, nur im `localStorage`
- Kein Cookie → kein CSRF-Risiko
- Kein serverseitiger Session-Store → kein Angriffsziel
- Token-Ablauf: 30 Tage, kein Refresh (erfordert Re-Login)

### Zeitstempel-Minimierung
- Kein exaktes Registrierungsdatum gespeichert
- Stattdessen: `created_week_hash = bcrypt(week_number + year + secret)`
- Beweist „aktiver Nutzer" ohne exaktes Datum

### Kommentar-Pseudonymisierung
- Autor wird als `SHA-256(tag + server_secret)` gespeichert
- Kein Fremdschlüssel auf `sf_users`
- Nur der Nutzer selbst (der seinen Tag kennt) kann seine Kommentare deanonymisieren

### No-Logging Konfiguration

```nginx
# nginx.conf – Logging deaktivieren
access_log off;
error_log /dev/null;
```

```yaml
# docker-compose.yml – Keine Logs persistieren
logging:
  driver: "none"
```

### Warrant Canary
- `/canary` – öffentlich erreichbar
- Enthält Datum der letzten manuellen Aktualisierung
- Solange aktuell: keine Behördenanfragen erhalten
- Technisch nicht automatisierbar (würde den Zweck unterlaufen)

### Jurisdiktion-Empfehlung
Für Produktionsdeployment:
- 🇮🇸 **Island**: Starkes Quellenschutzrecht, keine EU-Vorratsdatenspeicherung
- 🇳🇱 **Niederlande**: Starke Pressefreiheit, etablierte Hosting-Infrastruktur
- 🇨🇭 **Schweiz**: Bankgeheimnis-Tradition, DSGVO-äquivalentes Datenschutzrecht

### Tor Hidden Service
- `.onion`-Adresse als alternatives Zugangspunkt
- Konfiguration: Caddy + Tor-Daemon (Dokumentation folgt)
- Writers können über Tor uploaden ohne IP-Tracking auf Netzwerkebene

---

## Was dieses System NICHT schützt

Transparenz ist Teil des Sicherheitskonzepts:

- **Physische Observation**: Das System schützt nicht davor, beim Sprayen beobachtet zu werden
- **Browser-Forensik**: Wenn das Gerät beschlagnahmt wird, kann `localStorage` ausgelesen werden
- **Netzwerk-Metadaten**: Ohne Tor ist die IP des Uploaders dem ISP bekannt
- **Soziale Deanonymisierung**: Style-Erkennungsmerkmale sind inhärent identifizierend – das ist Graffiti
- **Admin-Kompromittierung**: Wenn der Server beschlagnahmt wird, sind Metadaten (Pseudonyme, Timestamps) verfügbar – aber kein Klarname, keine E-Mail, kein GPS

---

## Responsible Disclosure

Sicherheitslücken bitte nicht öffentlich reporten.
Kontakt: via verschlüsselter Nachricht an die Community-Kanäle.
