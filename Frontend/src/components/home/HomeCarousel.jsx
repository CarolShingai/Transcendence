import React from 'react';

function HomeCarousel({ cards = [], currentIndex = 0, onPrevious, onNext }) {
  return (
    <div className="home-carousel" aria-label="Carrossel de cards">
      <button
        type="button"
        className="carousel-arrow carousel-arrow-left"
        onClick={onPrevious}
        aria-label="Card anterior"
      >
        ‹
      </button>

      <div className="carousel-stage">
        {cards.map((card, index) => {
          const normalizedDistance = (index - currentIndex + cards.length) % cards.length;
          const positionClass =
            normalizedDistance === 0
              ? 'is-center'
              : normalizedDistance === 1
                ? 'is-right'
                : 'is-left';

          return (
            <article key={card.id} className={`carousel-item ${positionClass}`}>
              {card.content}
            </article>
          );
        })}
      </div>

      <button
        type="button"
        className="carousel-arrow carousel-arrow-right"
        onClick={onNext}
        aria-label="Proximo card"
      >
        ›
      </button>

      <div className="carousel-dots" aria-hidden="true">
        {cards.map((card, index) => (
          <span
            key={card.id}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HomeCarousel;