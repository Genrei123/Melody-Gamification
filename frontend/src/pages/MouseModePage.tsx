import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Composition } from '../services/api';

const MouseModePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Safely extract composition from location state
    const { composition } = location.state as { composition: Composition };

    const [playedNotes, setPlayedNotes] = useState<string[]>([]);

    // Generate playable notes from composition
    const availableNotes = useMemo(() => {
        // This is a simple parsing method - adjust based on your actual composition format
        return composition.composition
            .split(' ')
            .filter(note => /^[A-G]/.test(note))
            .slice(0, 7); // Limit to 7 notes for this example
    }, [composition]);

    const handleNotePress = (note: string) => {
        console.log(`Note pressed: ${note}`);
        setPlayedNotes(prev => [...prev, note]);
    };

    return (
        <div className="mouse-mode-container flex flex-col items-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-4">Mouse Mode: {composition.title}</h1>
            
            <div className="composition-details mb-6 text-center">
                <p className="text-lg">Original Composition: {composition.composition}</p>
            </div>

            <div className="notes-grid grid grid-cols-7 gap-4 mb-6">
                {availableNotes.map((note) => (
                    <button
                        key={note}
                        onClick={() => handleNotePress(note)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        {note}
                    </button>
                ))}
            </div>

            <div className="played-notes-section">
                <h2 className="text-xl mb-2">Played Notes:</h2>
                <p className="text-lg">{playedNotes.join(' - ')}</p>
            </div>

            <button 
                onClick={() => navigate('/')}
                className="mt-6 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            >
                Back to Compositions
            </button>
        </div>
    );
};

export default MouseModePage;