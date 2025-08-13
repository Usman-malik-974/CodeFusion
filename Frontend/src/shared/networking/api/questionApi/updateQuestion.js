const updateUser = async (updateData) => {
    console.log(updateData,id);
      try {
        const token=localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/questions/update`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
          body: JSON.stringify(updateData),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          return { error: data.error || 'Failed to update user' };
        }
        console.log(data);
        return data;
      } catch (error) {
        console.error('Error:', error);
        return { error: 'Something went wrong.' };
      }
    };
    
    export { updateUser };
    