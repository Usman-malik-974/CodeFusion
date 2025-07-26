const deleteUser = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            // token will be passed here 
          },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        return { error: data.error || 'Failed to delete user' };
      }
  
      return data;
    } catch (error) {
      console.error('Error:', error);
      return { error: 'Something went wrong.' };
    }
  };
  
  export { deleteUser };
  