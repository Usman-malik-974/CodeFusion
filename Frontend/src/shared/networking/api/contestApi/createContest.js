const createContest=async(contestData)=> {
    try {
        const token=localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/contests/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contestData)
        });
        const result = await response.json();
        if (!response.ok) {
            return { error: result.error || 'Failed to create contest' };
        }
        return result;
    } catch (error) {
        console.error('Error creating contest:', error.message);
        return {
            error: "Something went wrong.",
          };
    }
}

export { createContest };