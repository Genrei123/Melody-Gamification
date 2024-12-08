export interface Composition {
    id: number;
    title: string;
    composition: string;
}

export const fetchCompositions = async (): Promise<Composition[]> => {
    const response = await fetch('http://localhost:8000/getCompositions.php');
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch compositions.');
    }

    return data.data;
};
