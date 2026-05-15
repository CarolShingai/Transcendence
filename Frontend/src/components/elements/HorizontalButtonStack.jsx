import React, { useEffect, useMemo, useRef, useState } from 'react';
import CircleButton from './CircleButton';
import VerticalButtonStack from './VerticalButtonStack';

// HorizontalButtonStack
// Props:
// - buttons: [{ id, label, icon, onClick, color }]
// - buttonSize: number (px)
// - gap: number (px)
// - fallbackCollapseWidth: number (px) minimum width that should be available before falling back
//
// Behavior:
// - Tries to render all buttons in a single horizontal row.
// - If they do not fit, falls back to the current VerticalButtonStack behavior.

function HorizontalButtonStack({
  buttons = [],
  buttonSize = 40,
  gap = 8,
  fallbackCollapseWidth = 420,
}) {
  const containerRef = useRef(null);
  const [useVerticalFallback, setUseVerticalFallback] = useState(false);

  const orderedButtons = useMemo(() => (Array.isArray(buttons) ? [...buttons] : []), [buttons]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const measure = () => {
      try {
        const availableWidth = container.getBoundingClientRect().width;
        const requiredWidth = orderedButtons.length * buttonSize + Math.max(0, orderedButtons.length - 1) * gap;
        const shouldFallback = availableWidth < Math.max(requiredWidth, fallbackCollapseWidth);
        setUseVerticalFallback(shouldFallback);
      } catch (_error) {
        setUseVerticalFallback(false);
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [orderedButtons.length, buttonSize, gap, fallbackCollapseWidth]);

  const rowStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${gap}px`,
    flexWrap: 'nowrap',
    maxWidth: '100%',
    overflow: 'hidden',
  };

  return (
    <div ref={containerRef} style={{ minWidth: 0, maxWidth: '100%' }}>
      {useVerticalFallback ? (
        <VerticalButtonStack buttons={orderedButtons} buttonSize={buttonSize} />
      ) : (
        <div style={rowStyle}>
          {orderedButtons.map((button) => (
            <CircleButton
              key={button.id || button.label}
              icon={button.icon}
              tooltip={button.label}
              title={button.label}
              onClick={button.onClick}
              color={button.color}
              size={buttonSize}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HorizontalButtonStack;
