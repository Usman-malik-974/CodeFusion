import React from "react";
import { X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { signupUser } from "../shared/networking/api/signupUser";
import { toast } from "react-toastify";

const AddUserForm = ({ onClose }) => {
    const [loading, setLoading] = React.useState(false);

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            role: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            email: Yup.string().email("Invalid email").required("Email is required"),
            role: Yup.string().required("Role is required"),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const res = await signupUser(values.name, values.email, values.role);
                console.log(res);

                if (res.error) {
                    toast.error(res.error);
                } else if (res.message) {
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


        validateOnChange: false
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

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 rounded transition text-white ${loading
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
