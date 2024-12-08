import React, { useState } from 'react';

interface Item {
    name: string;
    description: string;
}

const AddItemForm: React.FC = () => {
    const [formData, setFormData] = useState<Item>({ name: '', description: '' });
    const [message, setMessage] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://yourdomain.com/backend/api/addItem.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (data.success) {
                setMessage('Item added successfully!');
                setFormData({ name: '', description: '' });
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <button type="submit">Add Item</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddItemForm;