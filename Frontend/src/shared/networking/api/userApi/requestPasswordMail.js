const requestPasswordMail = async (email) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/reqpassreset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({  email }),
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
  
  export { requestPasswordMail };
  