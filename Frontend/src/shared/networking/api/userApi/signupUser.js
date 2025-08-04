const signupUser = async (obj) => {
    try {
      const token=localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },
        body: JSON.stringify(obj),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Signup Error:", error);
      return {
        error: "Something went wrong.",
      };
    }
  };
  
  export { signupUser };
  