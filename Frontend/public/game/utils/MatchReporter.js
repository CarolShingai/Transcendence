// Helper para notificar o app pai quando uma partida terminar.
(function () {
  const GAME_MESSAGE_TYPE = 'MATCH_COMPLETED';

  function getGameMode() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      return params.get('gameMode') || params.get('mode') || 'single';
    } catch (_err) {
      return 'single';
    }
  }

  function postMatch(payload) {
    const targetOrigin = window.location.origin;
    const message = {
      type: GAME_MESSAGE_TYPE,
      payload: {
        ...payload,
        metadata: {
          ...(payload?.metadata || {}),
          gameMode: getGameMode()
        }
      }
    };

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, targetOrigin);
    }

    return message;
  }

  window.MatchReporter = {
    gameMessageType: GAME_MESSAGE_TYPE,
    getGameMode,
    postMatch
  };
})();
