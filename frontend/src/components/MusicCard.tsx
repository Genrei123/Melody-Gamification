import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Composition } from '../services/api';

interface MusicCardProps {
    composition: Composition;
}

const MusicCard: React.FC<MusicCardProps> = ({ composition }) => {
    const navigate = useNavigate();

    const handlePlay = () => {
        // Navigate to pairing mode selection, passing composition data
        navigate('/pairing-mode', { 
            state: { composition } 
        });
    };

    return (
        <div className="music-card p-4 border rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">{composition.title}</h2>
            <p className="mb-4">{composition.composition}</p>
            <button 
                onClick={handlePlay} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Play
            </button>
        </div>
    );
};

export default MusicCard;