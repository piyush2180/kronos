import React from 'react';
import { colors } from '../../theme/designTokens';

export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      userSelect: 'none',
      opacity: disabled ? 0.5 : 1,
    }}>
      <div style={{
        position: 'relative',
        width: '38px',
        height: '22px',
        backgroundColor: checked ? colors.goldAccent : 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: '12px',
        transition: 'background-color 0.15s ease',
      }}>
        <div style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '18px' : '2px',
          width: '16px',
          height: '16px',
          backgroundColor: checked ? '#15100c' : 'var(--color-text-secondary)',
          borderRadius: '50%',
          transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }} />
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      {label && <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{label}</span>}
    </label>
  );
}
