const assignBatch = async (batchId, userIds) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/batches/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId,
          userIds
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
      return {
        error: "Something went wrong.",
      };
    }
  };
  
  export { assignBatch };
  