// src/GameCard.js
import React from "react";
import { useNavigate } from 'react-router-dom';

const GameCard = ({ musicName, uploaderName, gameId, notes }) => {
  const navigate = useNavigate();

  const handlePlay = () => {
    // Navigate to GameController with gameId and notes as parameters
    navigate(`/game/${gameId}`, { state: { musicName, uploaderName, notes } });
  };

  return (
    <div className="game-card">
      <h2>{musicName}</h2>
      <p>Uploaded by: {uploaderName}</p>
      <button className="play-button" onClick={handlePlay}>
        Play
      </button>
    </div>
  );
};

export default GameCard;
