const addQuestion=async(questionData)=> {
    try {
        const token=localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/questions/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add question');
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding question:', error.message);
        throw error;
    }
}

export { addQuestion };