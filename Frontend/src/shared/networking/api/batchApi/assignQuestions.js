const assignQuestions = async (questionIds, batchId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/batches/assignQuestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionIds,
          batchId
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
  
  export { assignQuestions };
  