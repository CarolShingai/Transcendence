import React from 'react';
import Form from '../form/Form';

function ProfileCard({ initials, profileForm, error, onProfileChange, onProfileSave, onLogout }) {
  return (
    <section className="card" aria-label="Profile screen">
      <div className="profile-headline">
        <div className="avatar" aria-hidden="true">
          {initials}
        </div>
        <div>
          <p className="divider" aria-hidden="true">~ ~ 🕊️ ~ ~</p>
          <h2>Ninho do Viajante</h2>
          <p className="support-text">Atualize as informacoes publicas do seu perfil.</p>
        </div>
      </div>

      <Form id="profile-form" onSubmit={onProfileSave}>
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          name="name"
          type="text"
          value={profileForm.name}
          onChange={onProfileChange}
        />

        <label htmlFor="nickname">Codinome</label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          value={profileForm.nickname}
          onChange={onProfileChange}
        />

        <label htmlFor="profile-email">E-mail</label>
        <input
          id="profile-email"
          name="email"
          type="email"
          value={profileForm.email}
          disabled
          className="input-disabled"
        />

        <label htmlFor="bio">Rota pessoal</label>
        <textarea
          id="bio"
          name="bio"
          value={profileForm.bio}
          onChange={onProfileChange}
          rows="4"
        />

        {error && <p className="error">{error}</p>}
      </Form>

      <div className="actions-row">
        <button type="submit" form="profile-form" className="primary-button">
          Guardar trilha
        </button>
        <button type="button" className="ghost-button" onClick={onLogout}>
          Sair do ninho
        </button>
      </div>
    </section>
  );
}

export default ProfileCard;
