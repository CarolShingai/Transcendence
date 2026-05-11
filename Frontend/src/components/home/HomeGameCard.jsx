import React from 'react';

const asNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const formatDate = (value) => {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatStageLabel = (match) => {
  const mapId = asNumber(match?.mapId ?? match?.map?.id);
  const mapName = (match?.mapName || match?.map?.name || '').trim();

  if (mapId && mapName) {
    return `Fase ${mapId} • ${mapName}`;
  }

  if (mapId) {
    return `Fase ${mapId}`;
  }

  return mapName || '--';
};

const formatKm = (value) => {
  const numeric = asNumber(value);
  if (numeric === null) return '--';

  const rounded = Number.isInteger(numeric) ? `${numeric}` : numeric.toFixed(1);
  return `${rounded.replace('.', ',')} KM`;
};

const isPhaseThreeMatch = (match) => {
  const candidates = [match?.mapId, match?.stage, match?.phase, match?.level, match?.map?.id];
  return candidates.some((value) => asNumber(value) === 3);
};

const resolveMatchKm = (match) => {
  const km = asNumber(
    match?.km ??
    match?.distanceKm ??
    match?.distance ??
    match?.maxKm ??
    match?.score
  );

  return km ?? 0;
};

function HomeGameCard({ title, image, imageAlt, matches = [], onPlayGame, gameType }) {
  const phaseThreeBestKm = matches.reduce((bestKm, match) => {
    if (!isPhaseThreeMatch(match)) return bestKm;

    const km = resolveMatchKm(match);
    return km > bestKm ? km : bestKm;
  }, 0);

  return (
    <div className="card home-carousel-item-card has-footer-layout" aria-hidden="true">
      <header className="home-card-header" aria-hidden="true">
        <img src={image} alt={imageAlt} className="home-card-header-img" />
        <div className="home-card-record">
          <div className="home-card-record-label">RECORD:</div>
          <div className="home-card-record-time">{formatKm(phaseThreeBestKm)}</div>
        </div>
      </header>

      <div className="home-card-history-label">HISTÓRICO</div>
      <div className="home-card-history-divider" />

      <div className="home-card-matches-list">
        {matches.length === 0 ? (
          <div className="home-card-empty-state">
            <p>Nenhuma partida registrada!</p>
          </div>
        ) : (
          matches.map((match) => (
            <div key={match.id} className="home-card-match-item">
              <span className="home-card-match-date">{formatDate(match.createdAt || match.date)}</span>
              <span className="home-card-match-stage">{formatStageLabel(match)}</span>
              <span className="home-card-match-km">{formatKm(match.score ?? match.km ?? match.distanceKm)}</span>
            </div>
          ))
        )}
      </div>

      <div className="home-card-body" />

      <footer className="home-card-footer" aria-hidden="true">
        <button
          type="button"
          className="home-card-add-friend-button footer-play-button"
          onClick={() => onPlayGame(gameType)}
        >
          <span className="play-icon">▶</span>
          JOGUE AGORA!
        </button>
      </footer>
    </div>
  );
}

export default HomeGameCard;