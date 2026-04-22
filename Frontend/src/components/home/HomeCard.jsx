import React, { useState } from 'react';

const EMPTY_CARDS = [{ id: 1 }, { id: 2 }, { id: 3 }];

function HomeCard() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((previous) => (previous === 0 ? EMPTY_CARDS.length - 1 : previous - 1));
  };

  const goToNext = () => {
    setCurrentIndex((previous) => (previous === EMPTY_CARDS.length - 1 ? 0 : previous + 1));
  };

  return (
    <section className="home-card home-carousel-card" aria-label="Home screen">

      <div className="home-carousel" aria-label="Carrossel de cards">
        <button
          type="button"
          className="carousel-arrow carousel-arrow-left"
          onClick={goToPrevious}
          aria-label="Card anterior"
        >
          ‹
        </button>

        <div className="carousel-stage">
          {EMPTY_CARDS.map((card, index) => {
            const normalizedDistance = (index - currentIndex + EMPTY_CARDS.length) % EMPTY_CARDS.length;
            const positionClass =
              normalizedDistance === 0
                ? 'is-center'
                : normalizedDistance === 1
                  ? 'is-right'
                  : 'is-left';

            return (
              <article key={card.id} className={`carousel-item ${positionClass}`}>
                <div className="card home-carousel-item-card" aria-hidden="true" />
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="carousel-arrow carousel-arrow-right"
          onClick={goToNext}
          aria-label="Proximo card"
        >
          ›
        </button>
      </div>

      <div className="carousel-dots" aria-hidden="true">
        {EMPTY_CARDS.map((card, index) => (
          <span
            key={card.id}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HomeCard;
