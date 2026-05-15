import React, { useState } from 'react';

// CircleButton
// Props:
// - icon: React node (required)
// - tooltip: string (shown on hover)
// - onClick: function to call when clicked
// - size: number (px) optional, default 40
// - title: fallback accessible label
// - color: string or object with { background, color, borderColor, hoverBackground, hoverColor, hoverBorderColor, shadow }

function CircleButton({ icon, tooltip = '', onClick = () => {}, size = 40, title = '', color = null }) {
  const [isHovering, setIsHovering] = useState(false);
  const s = Math.max(24, Number(size) || 40);
  const theme = typeof color === 'string' ? { background: color, borderColor: color } : (color || {});
  const baseBackground = theme.background || 'transparent';
  const hoverBackground = theme.hoverBackground || theme.backgroundHover || baseBackground;
  const baseColor = theme.color || '#fff';
  const hoverColor = theme.hoverColor || baseColor;
  const baseBorderColor = theme.borderColor || 'rgba(255,255,255,0.12)';
  const hoverBorderColor = theme.hoverBorderColor || baseBorderColor;
  const btnStyle = {
    width: `${s}px`,
    height: `${s}px`,
    minWidth: `${s}px`,
    minHeight: `${s}px`,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${isHovering ? hoverBorderColor : baseBorderColor}`,
    background: isHovering ? hoverBackground : baseBackground,
    color: isHovering ? hoverColor : baseColor,
    cursor: 'pointer',
    padding: 0,
    boxSizing: 'border-box',
    boxShadow: theme.shadow || 'none',
    transition: 'transform 0.2s ease, filter 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease'
  };

  const tooltipStyle = {
    position: 'absolute',
    transform: 'translateY(-8px)',
    bottom: `calc(${s}px + 8px)`,
    left: '50%',
    transformOrigin: 'center',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
    background: 'rgba(0,0,0,0.8)',
    color: '#fff',
    padding: '6px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    zIndex: 1600
  };

  const wrapperStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div
      style={wrapperStyle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={() => setIsHovering(true)}
      onBlur={() => setIsHovering(false)}
    >
      <button
        type="button"
        aria-label={title || tooltip || 'action'}
        title={tooltip || title || ''}
        onClick={onClick}
        style={btnStyle}
      >
        {icon}
      </button>
      {tooltip && isHovering ? (
        <div className="circlebutton-tooltip" style={tooltipStyle}>
          {tooltip}
        </div>
      ) : null}
    </div>
  );
}

export default CircleButton;
