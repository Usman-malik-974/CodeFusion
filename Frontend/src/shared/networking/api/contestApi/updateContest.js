const updateContest=async(contestData)=> {
    try {
        const token=localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/contests/update`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contestData)
        });
        const result = await response.json();
        // console.log("Api res", result);
        if (!response.ok) {
            return { error: result.error || 'Failed to update Contest' };
        }
        return result;
    } catch (error) {
        console.error('Error updating contest:', error.message);
        throw error;
    }
}

export { updateContest };