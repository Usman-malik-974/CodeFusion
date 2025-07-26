const updateUser = async (id, updateData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          // token will be passed here 
        },
        body: JSON.stringify(updateData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        return { error: data.error || 'Failed to update user' };
      }
  
      return data;
    } catch (error) {
      console.error('Error:', error);
      return { error: 'Something went wrong.' };
    }
  };
  
  export { updateUser };
  