/*
 * Simple WebSocket client with reconnection, identification and event handler.
 * Usage:
 *   const client = createWebSocketClient({ token, url, onEvent, onStatus });
 *   client.send({ type: 'custom', payload: {} });
 *   client.close();
 */

const DEFAULT_PATH = (process.env.REACT_APP_WS_ENDPOINT) || (() => {
  const loc = window.location;
  const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  // Backend WebSocket is always on port 8082
  const host = loc.hostname || 'localhost';
  const port = 8082;
  return `${protocol}//${host}:${port}/ws`;
})();

export default function createWebSocketClient({ token, url = DEFAULT_PATH, onEvent = () => {}, onStatus = () => {} } = {}) {
  let socket = null;
  let closedByUser = false;
  let reconnectAttempts = 0;
  let eventHandler = onEvent;
  let statusHandler = onStatus;
  let pingInterval = null;

  function log(...args) {
    // Keep logs minimal — can be extended to use a logging service
    // eslint-disable-next-line no-console
    console.debug('[ws]', ...args);
  }

  function notifyStatus(status) {
    try { statusHandler(status); } catch (e) { log('status handler error', e); }
  }

  function notifyEvent(ev) {
    try { eventHandler(ev); } catch (e) { log('event handler error', e); }
  }

  function scheduleReconnect() {
    if (closedByUser) return;
    reconnectAttempts += 1;
    const delay = Math.min(30000, 1000 * (2 ** (reconnectAttempts - 1)));
    log('scheduling reconnect in ms', delay);
    notifyStatus('reconnecting');
    setTimeout(() => {
      connect();
    }, delay);
  }

  function startPing() {
    stopPing();
    // send a heartbeat every 25s to keep proxies alive
    pingInterval = setInterval(() => {
      try { send({ type: 'ping' }); } catch (_) {}
    }, 25000);
  }

  function stopPing() {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  }

  function connect() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

    const connectUrl = token ? `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : url;
    log('connecting to', connectUrl);
    notifyStatus('connecting');
    socket = new WebSocket(connectUrl);

    socket.addEventListener('open', () => {
      log('open');
      reconnectAttempts = 0;
      notifyStatus('connected');
      startPing();

      // identification is provided via token query param — server reads it on connect
    });

    socket.addEventListener('message', (raw) => {
      try {
        const data = JSON.parse(raw.data);
        notifyEvent(data);
      } catch (err) {
        log('invalid message', raw.data, err);
      }
    });

    socket.addEventListener('close', (ev) => {
      log('close', ev.code, ev.reason);
      stopPing();
      socket = null;
      if (!closedByUser) scheduleReconnect();
      else notifyStatus('disconnected');
    });

    socket.addEventListener('error', (err) => {
      log('error', err);
      // error will usually be followed by close — no extra handling here
      notifyStatus('error');
    });
  }

  function send(payload) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }

    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    socket.send(data);
  }

  function close() {
    closedByUser = true;
    stopPing();
    if (socket) {
      socket.close(1000, 'client_close');
      socket = null;
    }
    notifyStatus('disconnected');
  }

  function setEventHandler(fn) { eventHandler = fn; }
  function setStatusHandler(fn) { statusHandler = fn; }

  // initialize connection eagerly
  connect();

  return {
    send,
    close,
    setEventHandler,
    setStatusHandler
  };
}
