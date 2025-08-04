const getAllUsers = async () => {
    try {
      const token=localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users`,{
        headers: {
          'Authorization': `Bearer ${token}`,
      },
      });
      const data = await response.json();
      // console.log(data)
      return data;
    } catch (error) {
      console.error("Error:", error);
      return {
        error: "Something went wrong.",
      };
    }
  };
  
  export { getAllUsers };
  