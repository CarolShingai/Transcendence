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

function PublicProfileStatCard({ image, alt, value }) {
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
        <span className="public-profile-stat-label">RECORD:</span>
        <strong className="public-profile-stat-value">{resolveRecordValue(value)}</strong>
      </div>
    </article>
  );
}

function PublicProfileCard({ profile, singleRecord, rankedRecord }) {
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

  const singleValue = profile ? resolveRecord(profile, 'single', 0) : resolveRecordValue(singleRecord);
  const rankedValue = profile ? resolveRecord(profile, 'ranked', 0) : resolveRecordValue(rankedRecord);

  return (
    <section className="public-profile-page" aria-label="Dados públicos do perfil">
      <div className="public-profile-stats-grid">
        <PublicProfileStatCard
          image={singleTrans}
          alt="Single Trans"
          value={singleValue}
        />

        <PublicProfileStatCard
          image={rankedTrans}
          alt="Ranked Trans"
          value={rankedValue}
        />
      </div>
    </section>
  );
}

export default PublicProfileCard;