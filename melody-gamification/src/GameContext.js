// src/GameContext.js
import React, { createContext, useState } from 'react';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [port, setPort] = useState(null);
  const [writer, setWriter] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [noteIndex, setNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);

  return (
    <GameContext.Provider value={{
      port, setPort,
      writer, setWriter,
      gameStarted, setGameStarted,
      noteIndex, setNoteIndex,
      score, setScore,
      message, setMessage,
      autoPlayEnabled, setAutoPlayEnabled
    }}>
      {children}
    </GameContext.Provider>
  );
};
