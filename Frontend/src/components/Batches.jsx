import { useEffect, useState } from "react";
import { FaUser, FaLayerGroup } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";

const Batches = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [batches, setBatches] = useState([
    {
      batch_id: 1,
      batch_name: "Alpha Beginners",
      users: [
        { user_id: 1, name: "Alice Khan" },
        { user_id: 2, name: "Bob Sharma" },
        { user_id: 3, name: "Charlie Roy" },
      ],
    },
    {
      batch_id: 2,
      batch_name: "Beta Intermediates",
      users: [
        { user_id: 4, name: "David Patel" },
        { user_id: 5, name: "Eva Singh" },
        { user_id: 6, name: "Frank Gupta" },
      ],
    },
    {
      batch_id: 3,
      batch_name: "Gamma Advanced",
      users: [
        { user_id: 7, name: "Grace Mehta" },
        { user_id: 8, name: "Harry Kumar" },
        { user_id: 9, name: "Irene Das" },
      ],
    },
    {
      batch_id: 4,
      batch_name: "Delta Beginners",
      users: [
        { user_id: 10, name: "John Paul" },
        { user_id: 11, name: "Kevin George" },
        { user_id: 12, name: "Lara Hussain" },
      ],
    },
  ]);

  const validationSchema = Yup.object({
    batch_name: Yup.string()
      .required("Batch name is required")
      .min(3, "Batch name must be at least 3 characters"),
  });

  const formik = useFormik({
    initialValues: { batch_name: "" },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
    //   const newBatch = {
    //     batch_id: batches.length + 1,
    //     batch_name: values.batch_name,
    //     users: [],
    //   };
      //create api lgic here
      setBatches([...batches, newBatch]);
      resetForm();
      setShowForm(false);
    },
  });
  useEffect(()=>{
     //batch load api here
  },[]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h3 className="text-3xl text-blue-500 font-semibold text-center mb-6">
        Batches Management
      </h3>

      {!isLoading && (
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Search user"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 w-1/3"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <div className="flex gap-2 items-center">
            <button
              className="flex items-center gap-2 bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-blue-600 transition cursor-pointer"
              onClick={() => setShowForm(true)}
            >
              <FaLayerGroup size={16} />
              Create Batch
            </button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {batches.map((batch) => (
          <div
            key={batch.batch_id}
            className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm 
                       flex flex-col items-center text-center 
                       transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-blue-300"
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              {batch.batch_name}
            </h4>

            <div className="flex items-center gap-2 text-gray-700 bg-blue-50 px-4 py-2 rounded-full">
              <FaUser className="text-blue-500" />
              <span className="font-medium">{batch.users.length} Users</span>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Batch</h3>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Batch Name
                </label>
                <input
                  type="text"
                  name="batch_name"
                  placeholder="Enter batch name"
                  value={formik.values.batch_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none ${
                    formik.touched.batch_name && formik.errors.batch_name
                      ? "border-red-500"
                      : "border-gray-300 focus:border-blue-400"
                  }`}
                />
                {formik.touched.batch_name && formik.errors.batch_name && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.batch_name}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;
