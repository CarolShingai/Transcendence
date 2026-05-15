import React, { useEffect, useMemo, useRef, useState } from 'react';
import transLogo from '../../assets/logo/trans_logo.png';
import CircleButton from '../elements/CircleButton';
import VerticalButtonStack from '../elements/VerticalButtonStack';

function EditHeader({ onGoToHome, onLogout }) {
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const logoRef = useRef(null);
  const [useVerticalStack, setUseVerticalStack] = useState(false);

  const buttons = useMemo(() => ([
    {
      id: 'back',
      label: 'Voltar para home',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="header-back-icon">
          <path
            d="M14 6 8 12l6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: onGoToHome,
      color: {
        background: 'var(--card)',
        color: 'var(--accent)',
        borderColor: '#c3ddb7',
        hoverBackground: 'var(--card)',
        hoverColor: 'var(--accent-dark)',
        hoverBorderColor: '#a9cda0',
        shadow: '0 4px 10px rgba(11, 46, 29, 0.18)'
      }
    },
    {
      id: 'logout',
      label: 'Sair',
      icon: '✕',
      onClick: onLogout,
      color: {
        background: '#d42929',
        color: '#ffffff',
        borderColor: '#b91c1c',
        hoverBackground: '#c72222',
        hoverColor: '#ffffff',
        hoverBorderColor: '#991b1b'
      }
    }
  ]), [onGoToHome, onLogout]);

  useEffect(() => {
    const measure = () => {
      const headerEl = headerRef.current;
      const titleEl = titleRef.current;
      const logoEl = logoRef.current;

      if (!headerEl || !titleEl || !logoEl) return;

      const headerWidth = headerEl.getBoundingClientRect().width;
      const titleWidth = titleEl.getBoundingClientRect().width;
      const logoWidth = logoEl.getBoundingClientRect().width;

      const buttonCount = buttons.length;
      const buttonSize = 48;
      const buttonGap = 8;
      const buttonsWidth = (buttonCount * buttonSize) + ((buttonCount - 1) * buttonGap);

      const reservedSpacing = 48;
      const availableForActions = headerWidth - titleWidth - logoWidth - reservedSpacing;

      setUseVerticalStack(availableForActions < buttonsWidth);
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [buttons.length]);

  return (
    <header ref={headerRef} className="App-header App-header-home App-header-edit">
      <h1 ref={titleRef} className="edit-header-title">Editar perfil!</h1>

      <img ref={logoRef} className="home-header-logo edit-header-logo header-center-item" src={transLogo} alt="Transcendence" />

      <div className="home-header-actions" aria-label="Acoes da edicao">
        {useVerticalStack ? (
          <VerticalButtonStack buttons={buttons} />
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {buttons.map((button) => (
              <CircleButton
                key={button.id}
                icon={button.icon}
                tooltip={button.label}
                title={button.label}
                onClick={button.onClick}
                color={button.color}
                size={48}
              />
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

export default EditHeader;
