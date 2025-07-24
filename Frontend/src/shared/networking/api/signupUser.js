const signupUser = async (fullname, email, role) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullname, email, role }),
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
  