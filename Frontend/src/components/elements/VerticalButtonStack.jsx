import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import CircleButton from './CircleButton';

// VerticalButtonStack
// Props:
// - buttons: [{ id, label, icon (React node), onClick }]
// - collapseWidth: number (px) when viewport/container narrower than this the stack shows a sandwich toggle
// - buttonSize: number (px) square button size when shown as icon buttons
// Behavior:
// - Renders buttons stacked vertically. Newest items are shown first (topmost).
// - On small widths (container < collapseWidth) shows single square sandwich icon.
//   clicking the icon toggles a vertical dropdown of the buttons below the icon.

function VerticalButtonStack({ buttons = [], collapseWidth = 420, buttonSize = 40 }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const [compact, setCompact] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);

  // preserve the original order received by default
  const ordered = Array.isArray(buttons) ? [...buttons] : [];

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return undefined;

    const ro = new ResizeObserver(() => {
      try {
        const w = el.getBoundingClientRect().width;
        setCompact(w < collapseWidth);
      } catch (e) {
        // ignore
      }
    });
    ro.observe(el);
    // initial check
    try {
      const w = el.getBoundingClientRect().width;
      setCompact(w < collapseWidth);
    } catch (e) {}

    return () => ro.disconnect();
  }, [collapseWidth]);

  useEffect(() => {
    const onDocClick = (ev) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(ev.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    if (!open || !compact) {
      setAnchorRect(null);
      return undefined;
    }

    const updateAnchor = () => {
      const el = wrapperRef.current;
      if (!el) return;
      setAnchorRect(el.getBoundingClientRect());
    };

    updateAnchor();
    window.addEventListener('resize', updateAnchor);
    window.addEventListener('scroll', updateAnchor, true);
    return () => {
      window.removeEventListener('resize', updateAnchor);
      window.removeEventListener('scroll', updateAnchor, true);
    };
  }, [open, compact]);

  const sandwichIcon = (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="0" y="0" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="0" y="6" width="18" height="2" rx="1" fill="currentColor" />
      <rect x="0" y="12" width="18" height="2" rx="1" fill="currentColor" />
    </svg>
  );

  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'flex-start',
    position: 'relative'
  };

  const stackStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const dropdownStyle = {
    position: 'fixed',
    top: anchorRect ? anchorRect.bottom + 8 : 0,
    left: anchorRect ? anchorRect.left : 0,
    zIndex: 9999,
    boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
    background: 'transparent'
  };

  const listInnerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.02)'
  };

  return (
    <div ref={wrapperRef} style={containerStyle}>
      {compact ? (
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <CircleButton
            icon={sandwichIcon}
            tooltip={open ? 'Fechar ações' : 'Abrir ações'}
            title={open ? 'Fechar ações' : 'Abrir ações'}
            onClick={() => setOpen((s) => !s)}
            size={buttonSize}
          />

          {open && anchorRect ? ReactDOM.createPortal(
            <div style={dropdownStyle}>
              <div style={listInnerStyle}>
                {ordered.map((b) => (
                  <CircleButton
                    key={b.id || b.label}
                    icon={b.icon}
                    tooltip={b.label}
                    title={b.label}
                    color={b.color}
                    onClick={(e) => {
                      try { b.onClick && b.onClick(e); } catch (err) {}
                      setOpen(false);
                    }}
                    size={buttonSize}
                  />
                ))}
              </div>
            </div>,
            document.body
          ) : null}
        </div>
      ) : (
        <div style={stackStyle}>
          {ordered.map((b) => (
            <CircleButton
              key={b.id || b.label}
              icon={b.icon}
              tooltip={b.label}
              title={b.label}
              color={b.color}
              onClick={b.onClick}
              size={buttonSize}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default VerticalButtonStack;
