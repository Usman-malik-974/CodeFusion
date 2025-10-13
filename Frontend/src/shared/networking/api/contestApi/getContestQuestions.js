const getContestQuestions = async (id) => {
    try {
      const token=localStorage.getItem('token');
      console.log(token);
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/contests/getcontestquestions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
      },
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
  
  export { getContestQuestions };
  