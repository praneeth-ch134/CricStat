import React, { createContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [matchUpdates, setMatchUpdates] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    // Set up event listeners
    socket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socket.on('match_update', (data) => {
      console.log('Match update received:', data);
      setMatchUpdates(prev => ({
        ...prev,
        [data.matchId]: data
      }));
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to subscribe to a specific match
  const subscribeToMatch = (matchId) => {
    if (socketRef.current) {
      console.log(`Subscribing to match ${matchId}`);
      socketRef.current.emit('subscribe_match', { matchId });
    }
  };

  // Function to unsubscribe from a specific match
  const unsubscribeFromMatch = (matchId) => {
    if (socketRef.current) {
      console.log(`Unsubscribing from match ${matchId}`);
      socketRef.current.emit('unsubscribe_match', { matchId });
    }
  };

  // Function to send a ball update
  const sendBallUpdate = (matchId, ballData) => {
    if (socketRef.current) {
      console.log(`Sending ball update for match ${matchId}`, ballData);
      socketRef.current.emit('ball_update', { matchId, ...ballData });
    }
  };

  return (
    <SocketContext.Provider 
      value={{ 
        connected,
        matchUpdates,
        subscribeToMatch,
        unsubscribeFromMatch,
        sendBallUpdate
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;