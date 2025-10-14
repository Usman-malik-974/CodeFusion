const resetPassword = async (token,newPassword) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/resetpass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token,newPassword }),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Login Error:", error);
      return {
        error: "Something went wrong.",
      };
    }
  };
  
  export { resetPassword };
  