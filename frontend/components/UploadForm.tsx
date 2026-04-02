'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';

interface StyleTag {
  id: string;
  name: string;
}

interface UploadFormProps {
  styleTags: StyleTag[];
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1970 + 1 }, (_, i) => CURRENT_YEAR - i);

export default function UploadForm({ styleTags }: UploadFormProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
      setMessage('Bitte ein Bild auswählen.');
      setState('error');
      return;
    }

    selectedTags.forEach((id) => formData.append('style_tags', id));

    setState('uploading');
    setMessage('');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok) {
        setState('error');
        setMessage(json.error ?? 'Upload fehlgeschlagen.');
        return;
      }

      setState('success');
      setMessage(json.message ?? 'Foto eingereicht.');
      form.reset();
      setPreview(null);
      setSelectedTags([]);
    } catch {
      setState('error');
      setMessage('Netzwerkfehler. Bitte erneut versuchen.');
    }
  }

  const inputStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--bg-border)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    padding: '10px 12px',
    width: '100%',
    outline: 'none',
  } as const;

  const labelStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    display: 'block',
    marginBottom: '6px',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Datei-Upload */}
      <div>
        <label style={labelStyle}>Bild *</label>
        <div
          style={{
            border: '1px dashed var(--bg-border)',
            background: 'var(--bg-raised)',
            cursor: 'pointer',
            position: 'relative',
          }}
          className="flex flex-col items-center justify-center min-h-48 transition-colors hover:border-[var(--text-dim)]"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Vorschau"
              className="max-h-64 max-w-full object-contain"
            />
          ) : (
            <div className="text-center p-8">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}
                 className="uppercase tracking-widest">
                Datei auswählen
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}
                 className="mt-2">
                JPEG · PNG · WebP · HEIC · max. 30 MB
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent)', marginTop: '8px' }}
                 className="uppercase tracking-widest">
                EXIF wird automatisch entfernt
              </p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleFileChange}
            className="sr-only"
            required
          />
        </div>
      </div>

      {/* Writer Tag */}
      <div>
        <label style={labelStyle} htmlFor="writer_tag">Writer Tag</label>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)', marginBottom: '6px' }}
           className="uppercase tracking-widest">
          Pseudonym – kein Klarname
        </p>
        <input
          type="text"
          id="writer_tag"
          name="writer_tag"
          placeholder="z.B. SEAK"
          style={inputStyle}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Crew */}
      <div>
        <label style={labelStyle} htmlFor="crew_name">Crew</label>
        <input
          type="text"
          id="crew_name"
          name="crew_name"
          placeholder="z.B. MAD"
          style={inputStyle}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Ort */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label style={labelStyle} htmlFor="location_city">Stadt</label>
          <input
            type="text"
            id="location_city"
            name="location_city"
            placeholder="z.B. Berlin"
            style={inputStyle}
            autoComplete="off"
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="location_country">Land</label>
          <input
            type="text"
            id="location_country"
            name="location_country"
            placeholder="z.B. DE"
            style={inputStyle}
            autoComplete="off"
            maxLength={4}
          />
        </div>
      </div>

      {/* Jahr */}
      <div>
        <label style={labelStyle} htmlFor="year">Jahr</label>
        <select
          id="year"
          name="year"
          style={{ ...inputStyle, appearance: 'none' }}
        >
          <option value="">– unbekannt –</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Style Tags */}
      {styleTags.length > 0 && (
        <div>
          <label style={labelStyle}>Style</label>
          <div className="flex flex-wrap gap-2">
            {styleTags.map((tag) => {
              const active = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '4px 10px',
                    border: active
                      ? '1px solid var(--accent)'
                      : '1px solid var(--bg-border)',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Legal Wall */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_legal_wall"
          name="is_legal_wall"
          value="true"
          style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
        />
        <label
          htmlFor="is_legal_wall"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}
          className="uppercase tracking-widest"
        >
          Legal Wall / Hall of Fame
        </label>
      </div>

      {/* Status Message */}
      {message && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            padding: '10px 14px',
            border: `1px solid ${state === 'error' ? 'var(--danger)' : 'var(--accent)'}`,
            color: state === 'error' ? 'var(--danger)' : 'var(--accent)',
            background: state === 'error' ? 'rgba(255,68,68,0.06)' : 'var(--accent-dim)',
          }}
          className="uppercase tracking-widest"
        >
          {message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={state === 'uploading'}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          padding: '12px 24px',
          background: state === 'uploading' ? 'var(--bg-border)' : 'var(--accent)',
          color: state === 'uploading' ? 'var(--text-dim)' : 'var(--bg)',
          border: 'none',
          cursor: state === 'uploading' ? 'not-allowed' : 'pointer',
          width: '100%',
          transition: 'opacity 0.15s',
        }}
      >
        {state === 'uploading' ? 'Wird verarbeitet…' : 'Einreichen'}
      </button>

      <p
        style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)', lineHeight: 1.8 }}
        className="uppercase tracking-widest"
      >
        EXIF-Daten (GPS, Kamera, Zeitstempel) werden vor der Speicherung automatisch entfernt.
        Eingereichte Fotos werden manuell moderiert und erst danach veröffentlicht.
      </p>
    </form>
  );
}
