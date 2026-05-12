import React from 'react';
import singleTrans from '../../assets/logo/SINGLE_TRANS.png';
import rankedTrans from '../../assets/logo/RANKED_TRANS.png';

function resolveRecordValue(recordValue) {
  if (recordValue === null || recordValue === undefined || recordValue === '') {
    return '0';
  }

  if (typeof recordValue === 'number' && Number.isFinite(recordValue)) {
    return String(recordValue);
  }

  return String(recordValue);
}

function PublicProfileStatCard({ image, alt, label = 'RECORD:', value }) {
  return (
    <article
      className="public-profile-stat-card"
      aria-label={alt}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        width: '100%',
        height: '90%',
        aspectRatio: '1 / 1',
        boxSizing: 'border-box',
      }}
    >
      <header
        className="public-profile-stat-header"
        style={{
          flex: '0 0 27%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem',
          boxSizing: 'border-box',
        }}
      >
        <img
          className="public-profile-stat-image"
          src={image}
          alt={alt}
          style={{ maxHeight: '100%', maxWidth: '80%', objectFit: 'contain' }}
        />
      </header>

      <div
        className="public-profile-stat-body"
        style={{
          flex: '0 0 70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.25rem',
          padding: '0.5rem',
          boxSizing: 'border-box',
        }}
      >
        <span className="public-profile-stat-label">{label}</span>
        <strong className="public-profile-stat-value" style={{ fontSize: '2.4rem' }}>
          {resolveRecordValue(value)}{label === 'RECORD:' ? ' KM' : ''}
        </strong>
      </div>
    </article>
  );
}

function PublicProfileCard({ profile, singleRecord, rankedRecord, rankedPosition, bestScore }) {
  const resolveRecord = (p, type, fallback = 0) => {
    if (!p) return fallback;
    if (type === 'single') {
      return (
        p?.records?.single ?? p?.singleRecord ?? p?.singleScore ?? p?.singleWins ?? fallback
      );
    }
    return (
      p?.records?.ranked ?? p?.rankedRecord ?? p?.rankedScore ?? p?.rankedWins ?? fallback
    );
  };

  const resolvedBestScore = Number(bestScore);
  const hasBestScore = Number.isFinite(resolvedBestScore);
  const singleValue = hasBestScore
    ? String(Math.round(resolvedBestScore))
    : resolveRecordValue(
        profile
          ? (resolveRecord(profile, 'single', null) ?? profile?.bestScore ?? profile?.records?.bestScore)
          : singleRecord
      );
  const rankedValue = rankedPosition ? `#${rankedPosition}` : 'Jogador ainda não pontuou!';

  return (
    <section className="public-profile-page" aria-label="Dados públicos do perfil">
      <div className="public-profile-stats-grid">
        <PublicProfileStatCard
          image={singleTrans}
          alt="Single Trans"
          label="RECORD:"
          value={singleValue}
        />

        <PublicProfileStatCard
          image={rankedTrans}
          alt="Ranked Trans"
          label="POSIÇÃO:"
          value={rankedValue}
        />
      </div>
    </section>
  );
}

export default PublicProfileCard;