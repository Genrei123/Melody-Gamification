import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Composition } from '../services/api';

const PairingModePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Safely extract composition from location state
    const { composition } = location.state as { composition: Composition };

    const handleGizduinoMode = () => {
        // Navigate to Gizduino mode (you can implement this later)
        console.log('Gizduino Mode Selected');
    };

    const handleMouseMode = () => {
        // Navigate to Mouse mode, passing composition data
        navigate('/mouse-mode', { 
            state: { composition } 
        });
    };

    return (
        <div className="pairing-mode-container flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-6">Choose Pairing Mode</h1>
            <h2 className="text-xl mb-4">Composition: {composition.title}</h2>
            
            <div className="mode-buttons flex space-x-4">
                <button 
                    onClick={handleGizduinoMode}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300"
                >
                    Gizduino Mode
                </button>
                <button 
                    onClick={handleMouseMode}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                    Mouse Mode
                </button>
            </div>
        </div>
    );
};

export default PairingModePage;