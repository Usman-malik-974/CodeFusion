const createBatch = async (batchData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/batches/create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batchData),
      }
    );

    const result = await response.json();

    // Agar HTTP status 400+ hai to error return karo
    if (!response.ok) {
      return { error: result.message || result.error || "Request failed" };
    }

    return result; // success
  } catch (error) {
    console.error("Error creating batch:", error.message);
    return { error: "Something went wrong." };
  }
};

export { createBatch };
