import React from 'react';

function Error5xx({ code = 500 }) {
  return (
    <section className="card" aria-label="Erro 5xx">
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

export default Error5xx;
