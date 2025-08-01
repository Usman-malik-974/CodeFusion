const getAllQuestions= async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/questions`,{
        headers: {
          // token will be passed here 
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
  
  export { getAllQuestions };
  