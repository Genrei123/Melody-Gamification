// src/useFetchCompositions.js
import { useEffect, useState } from 'react';
import axios from 'axios';

const useFetchCompositions = () => {
  const [compositions, setCompositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompositions = async () => {
      try {
        const response = await axios.get('http://localhost/melody-backend/fetch_compositions.php');
        setCompositions(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompositions();
  }, []);

  return { compositions, loading, error };
};

export default useFetchCompositions;