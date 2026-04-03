'use client';

import { useState, useEffect, useRef } from 'react';
import type { SfComment } from '@/types/directus';

interface CommentSectionProps {
  photoId: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function CommentSection({ photoId }: CommentSectionProps) {
  const [comments, setComments] = useState<SfComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auth-Status aus localStorage
    const token = localStorage.getItem('sf_token');
    setIsLoggedIn(!!token);

    // Kommentare laden
    fetch(`/api/comments?photo_id=${photoId}`)
      .then(r => r.json())
      .then(data => setComments(data.comments ?? []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [photoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setError('');

    const token = localStorage.getItem('sf_token');
    if (!token) {
      setError('Bitte einloggen um zu kommentieren.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photo_id: photoId, text: text.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Fehler beim Senden.');
        return;
      }

      setComments(prev => [...prev, json.comment]);
      setText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch {
      setError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  const mono = { fontFamily: 'var(--font-mono)' } as const;

  return (
    <div style={{ borderTop: '1px solid var(--bg-border)', paddingTop: '20px' }}>
      {/* Header */}
      <p style={{ ...mono, fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.12em' }}
         className="uppercase mb-4">
        Kommentare {comments.length > 0 && `(${comments.length})`}
      </p>

      {/* Liste */}
      {loading ? (
        <p style={{ ...mono, fontSize: '11px', color: 'var(--text-dim)' }}>…</p>
      ) : comments.length === 0 ? (
        <p style={{ ...mono, fontSize: '11px', color: 'var(--text-dim)' }}>
          Noch keine Kommentare.
        </p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((c) => (
            <div
              key={c.id}
              style={{ borderLeft: '2px solid var(--bg-border)', paddingLeft: '12px' }}
            >
              <div className="flex items-baseline gap-3 mb-1">
                <span style={{ ...mono, fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>
                  {c.author_tag}
                </span>
                <span style={{ ...mono, fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
                  {formatDate(c.created_at)}
                </span>
              </div>
              <p style={{ ...mono, fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Formular (nur für eingeloggte User) */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextareaInput}
            placeholder="Kommentar schreiben…"
            maxLength={500}
            rows={2}
            style={{
              ...mono,
              fontSize: '12px',
              color: 'var(--text-primary)',
              background: 'var(--bg)',
              border: '1px solid var(--bg-border)',
              padding: '8px 10px',
              width: '100%',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.6,
              overflow: 'hidden',
            }}
          />
          <div className="flex items-center justify-between gap-2">
            {text.length > 400 && (
              <span style={{ ...mono, fontSize: '9px', color: text.length > 480 ? 'var(--danger)' : 'var(--text-dim)' }}>
                {500 - text.length} Zeichen übrig
              </span>
            )}
            {error && (
              <span style={{ ...mono, fontSize: '10px', color: 'var(--danger)' }}>{error}</span>
            )}
            <button
              type="submit"
              disabled={submitting || text.trim().length === 0}
              className="ml-auto"
              style={{
                ...mono,
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '6px 14px',
                background: submitting || text.trim().length === 0 ? 'var(--bg-border)' : 'var(--accent)',
                color: submitting || text.trim().length === 0 ? 'var(--text-dim)' : 'var(--bg)',
                border: 'none',
                cursor: submitting || text.trim().length === 0 ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              {submitting ? '…' : 'Senden'}
            </button>
          </div>
        </form>
      ) : (
        <p style={{ ...mono, fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
          <a href="/login" style={{ color: 'var(--accent)' }}>Einloggen</a>
          {' '}um zu kommentieren. Nur verifizierte Accounts.
        </p>
      )}
    </div>
  );
}
