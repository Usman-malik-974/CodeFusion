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
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create batch");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating batch:", error.message);
    throw error;
  }
};

export { createBatch };
