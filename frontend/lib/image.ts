import sharp from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
}

/**
 * Verarbeitet ein hochgeladenes Bild:
 * 1. EXIF vollständig entfernen (GPS, Timestamp, Kameramodell)
 * 2. In WebP konvertieren
 *
 * SICHERHEITSHINWEIS: Sharp entfernt standardmäßig alle Metadaten,
 * wenn withMetadata() NICHT aufgerufen wird. Wir rufen es bewusst
 * nicht auf – kein GPS, kein Timestamp, kein Kameramodell landet in der Datei.
 * .rotate() liest die EXIF-Orientierung VOR dem Strip aus und rotiert korrekt.
 */
export async function processImage(inputBuffer: Buffer): Promise<ProcessedImage> {
  const result = await sharp(inputBuffer)
    .rotate() // Auto-Rotation nach EXIF (vor dem Strip)
    // Kein .withMetadata() → alle Metadaten werden entfernt (Sharp-Default)
    .webp({ quality: 85, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
  };
}

/**
 * Erstellt ein Thumbnail (Grid-Ansicht)
 */
export async function createThumbnail(inputBuffer: Buffer, width = 600): Promise<Buffer> {
  return sharp(inputBuffer)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 75, effort: 3 })
    .toBuffer();
}
