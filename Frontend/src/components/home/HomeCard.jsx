import React from 'react';

function HomeCard({ profile }) {
  const displayName = profile?.nickname || profile?.name || 'Viajante';

  return (
    <section className="card home-card" aria-label="Home screen">
      <h2>Bem-vindo, {displayName}</h2>
      <p className="support-text home-support-text">
        Escolha sua proxima acao para continuar a jornada migratoria.
      </p>
    </section>
  );
}

export default HomeCard;
