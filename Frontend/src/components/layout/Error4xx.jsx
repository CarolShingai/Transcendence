import React from 'react';

function Error4xx({ code = 404 }) {
  return (
    <section className="card" aria-label="Erro 4xx">
      <div style={{ textAlign: 'center' }}>
        <h2>{`ERRO "${code}"`}</h2>
        <p>
          Nenhum pássaros a vista!
          <br />
          Tente novamente mais tarde.
        </p>
      </div>
    </section>
  );
}

export default Error4xx;
