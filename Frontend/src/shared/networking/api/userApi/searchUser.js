const searchUser = async (query,by) => {
    try {
      const token=localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/users/search`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
        },
          method: "POST",
          body: JSON.stringify({ query,by }),
        }
      );
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Search Error:", error);
      return {
        error: "Something went wrong.",
      };
    }
  };
  
  export { searchUser };
  