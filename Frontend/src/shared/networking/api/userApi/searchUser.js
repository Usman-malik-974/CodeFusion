const searchUser = async (query) => {
    try {
      const token=localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/users/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
        },
          method: "GET",
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
  