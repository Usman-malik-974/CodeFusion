import React from "react";
import { X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { signupUser } from "../shared/networking/api/userApi/signupUser";
import { toast } from "react-toastify";

const AddUserForm = ({ onClose, onAdd }) => {
  const [loading, setLoading] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      rollno: "",
      name: "",
      email: "",
      course: "",
      // section: "",
      session: "",
      role: "",
    },
    validationSchema: Yup.object({
      rollno: Yup.number()
        .typeError("Roll no must be a number")
        .when("role", {
          is: "user",
          then: (schema) => schema.required("Roll no is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      course: Yup.string().when("role", {
        is: "user",
        then: (schema) => schema.required("Course is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      session: Yup.string().when("role", {
        is: "user",
        then: (schema) =>
          schema
            .required("Session is required")
            .matches(
              /^\d{4}-\d{4}$/,
              "Session must be in the format YYYY-YYYY"
            ),
        otherwise: (schema) => schema.notRequired(),
      }),
      role: Yup.string().required("Role is required"),
    }),
    onSubmit: async (values) => {
      console.log("Submitted values:", values);
      setLoading(true);
      try {
        //change this acc to role
        const res = await signupUser({ ...values, fullname: values.name });
        console.log(res);

        if (res.error) {
          toast.error(res.error);
        } else if (res.message) {
          if (res.id) {
            onAdd({
              id: res.id,
              name: values.name,
              email: values.email,
              role: values.role,
              rollno: values.rollno,
              course: values.course,
              session: values.session,
            });
          }
          toast.success(res.message);
        } else {
          toast.success("User created successfully!");
        }
      } catch (err) {
        toast.error("Network error");
      } finally {
        setLoading(false);
        onClose();
      }
    },

    validateOnChange: false,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-blue-600 mb-4 text-center">
          Add New User
        </h2>

        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <select
              name="role"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            {formik.touched.role && formik.errors.role && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.role}</p>
            )}
          </div>

          {formik.values.role === "user" && (
            <div>
              <input
                type="number"
                name="rollno"
                placeholder="Roll Number"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formik.values.rollno}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.rollno && formik.errors.rollno && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.rollno}
                </p>
              )}
            </div>
          )}

          {formik.values.role === "user" && (
            <div>
              <select
                name="course"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formik.values.course}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select Course</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
              </select>
              {formik.touched.course && formik.errors.course && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.course}
                </p>
              )}
            </div>
          )}

          {formik.values.role === "user" && (
            <div>
              <input
                type="text"
                name="session"
                placeholder="Session(e.g. 20XX-20XX)"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formik.values.session}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.session && formik.errors.session && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.session}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded transition text-white ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;
