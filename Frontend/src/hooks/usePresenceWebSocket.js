import { useState, useEffect, useRef, useCallback } from 'react';

const WS_BASE = (process.env.REACT_APP_API_URL || 'https://localhost:8082')
    .replace(/^https/, 'wss')
    .replace(/^http/, 'ws');

const RECONNECT_BASE_DELAY = 2000;
const MAX_RECONNECT_ATTEMPTS = 10;


export default function usePresenceWebSocket(token) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
 
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);
  const tokenRef = useRef(token);
 
  // Manter ref atualizada sem causar re-render do effect
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);
 
  const cleanup = useCallback(() => {
    clearTimeout(reconnectTimer.current);
    reconnectTimer.current = null;
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);
 
  const connect = useCallback(() => {
    const currentToken = tokenRef.current;
    if (!currentToken) return;
 
    cleanup();
 
    const ws = new WebSocket(`${WS_BASE}/ws?token=${currentToken}`);
 
    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };
 
    ws.onmessage = (event) => {
        const data = parseMessage(event);
        if (!data) return;

        setLastEvent(data);
        handlePresenceEvent(data, setOnlineUsers);
    };
 
    ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        scheduleReconnect({
            reconnectAttempts,
            reconnectTimer,
            connect,
            tokenRef
        });
    };
 
    ws.onerror = () => {
      // onclose será chamado automaticamente após onerror
    };
 
    wsRef.current = ws;
  }, [cleanup]);
 
  useEffect(() => {
    if (token) {
      reconnectAttempts.current = 0;
      connect();
    } else {
      cleanup();
      setIsConnected(false);
      setOnlineUsers([]);
      setLastEvent(null);
    }
 
    return cleanup;
  }, [token, connect, cleanup]);
 
  return { onlineUsers, isConnected, lastEvent };
}

// aid fucntion OnConnect
function parseMessage(event) {
  try {
    return JSON.parse(event.data);
  } catch {
    return null;
  }
}

function handlePresenceEvent(data, setOnlineUsers) {
  if (data.type === 'presence' && Array.isArray(data.onlineUsers)) {
    setOnlineUsers(data.onlineUsers);
  }
}

// aid functions onClose
function getReconnectDelay(attempt) {
  return RECONNECT_BASE_DELAY * Math.pow(1.5, attempt);
}

function scheduleReconnect({ reconnectAttempts, reconnectTimer, connect, tokenRef }) {
  if (!tokenRef.current || reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) return;

  const delay = getReconnectDelay(reconnectAttempts.current);

  reconnectTimer.current = setTimeout(() => {
    reconnectAttempts.current += 1;
    connect();
  }, delay);
}