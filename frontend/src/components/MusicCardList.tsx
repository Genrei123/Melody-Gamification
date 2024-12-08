import React, { useEffect, useState } from 'react';
import MusicCard from './MusicCard';
import { fetchCompositions, Composition } from '../services/api';

const MusicCardList: React.FC = () => {
    const [compositions, setCompositions] = useState<Composition[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getCompositions = async () => {
            try {
                const data = await fetchCompositions();
                setCompositions(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        getCompositions();
    }, []);

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">Error: {error}</p>;

    return (
        <div className="music-card-list">
            <h1>Music Compositions</h1>
            <div className="card-container">
                {compositions.map((composition) => (
                    <MusicCard
                        key={composition.id}
                        composition={composition}
                    />
                ))}
            </div>
        </div>
    );
};

export default MusicCardList;