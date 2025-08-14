const deleteBatch = async (id) => {
    try {
      const token=localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/batches/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        return { error: data.error || 'Failed to delete batch' };
      }
  
      return data;
    } catch (error) {
      console.error('Error:', error);
      return { error: 'Something went wrong.' };
    }
  };
  
  export { deleteBatch};
  