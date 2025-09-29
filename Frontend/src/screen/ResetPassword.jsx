import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from 'yup'

const validationSchema = Yup.object({
    newPassword: Yup.string()
        .required("This Field is Required")
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password cannot be more than 20 characters"),

    confirmPassword: Yup.string()
        .required("This Field is Required")
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password cannot be more than 20 characters")
        .oneOf([Yup.ref('newPassword'), null], "Password must match")
});

const ResetPassword = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formik = useFormik({
        initialValues: {
            newPassword: "",
            confirmPassword: ""
        },
        validationSchema,
        validateOnChange: false,
        onSubmit: async function (values, { resetForm }) {
            setIsSubmitting(true);
            setTimeout(() => {

                console.log(values);
                setIsSubmitting(false);
            }, 2000)
        }
    })
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
            <div className="shadow-lg bg-white px-8 py-6 rounded-lg w-full max-w-sm">
                <div className="flex items-center justify-center gap-1 mb-2">
                    <h3 className="text-blue-600 text-3xl font-bold">Reset Password</h3>
                </div>
                <form className="space-y-5" onSubmit={formik.handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            {...formik.getFieldProps("newPassword")}
                            type="password"
                            placeholder="Enter new password"
                            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-neutral-100"
                                }`}
                        />
                        {formik.errors.newPassword && formik.touched.newPassword && (
                            <p className="text-red-500 text-sm mt-1">{formik.errors.newPassword}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            {...formik.getFieldProps("confirmPassword")}
                            type="password"
                            placeholder="Confirm new password"
                            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-neutral-100"
                                }`}
                        />
                        {formik.errors.confirmPassword && formik.touched.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
                        )}
                    </div>
                    <button type="submit" className="bg-blue-500 text-white py-2 px-3 rounded-lg cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed" disabled={isSubmitting}>
                        {isSubmitting ? "Resetting..." : "Reset"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword;