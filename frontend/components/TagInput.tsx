'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface TagInputProps {
  name: string;
  placeholder?: string;
  label: string;
}

export default function TagInput({ name, placeholder, label }: TagInputProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(value: string) {
    const trimmed = value.trim().replace(/,+$/, '').trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setInput('');
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val.endsWith(',')) {
      addTag(val.slice(0, -1));
    } else {
      setInput(val);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === 'Tab') && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  return (
    <div>
      <label
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          display: 'block',
          marginBottom: '4px',
        }}
      >
        {label}
      </label>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        color: 'var(--text-dim)',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        Komma oder Enter zum Bestätigen
      </p>

      {/* Hidden inputs für Form-Submit */}
      {tags.map((tag, i) => (
        <input key={i} type="hidden" name={name} value={tag} />
      ))}

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : '+ weiterer Eintrag'}
        autoComplete="off"
        spellCheck={false}
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--bg-border)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          padding: '10px 12px',
          width: '100%',
          outline: 'none',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => {
          e.target.style.borderColor = 'var(--bg-border)';
          if (input.trim()) addTag(input);
        }}
      />

      {/* Chips */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          {tags.map(tag => (
            <span
              key={tag}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                background: 'var(--accent-dim)',
                padding: '3px 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--accent)',
                  padding: '0',
                  lineHeight: 1,
                  fontSize: '13px',
                  opacity: 0.7,
                }}
                aria-label={`${tag} entfernen`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
