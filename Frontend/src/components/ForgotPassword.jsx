import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { requestPasswordMail } from "../shared/networking/api/userApi/requestPasswordMail";
import {toast} from "react-toastify";

const validationSchema = Yup.object({
    email: Yup.string()
        .email("Please enter a Valid Email")
        .required("Email is Required"),
});


const ForgotPassword = ({ onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formik = useFormik({
        initialValues: {
            email: ""
        },
        validationSchema,
        validateOnChange: false,
        onSubmit: async function (values) {
            try{
                setIsSubmitting(true);
                const res=await requestPasswordMail(values.email);
                if(res.error){
                    toast.error(res.error);
                    return;
                }
                toast.success(res.message);
            }
            catch(e){
                toast.error("Something went wrong");
            }
            finally{
                onClose();
                setIsSubmitting(false);
            }
        }
    })
    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 text-gray-900 relative">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold transition-colors"
            >
                ✖
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
                Forgot Password Form
            </h2>
            <form className="space-y-5" onSubmit={formik.handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        {...formik.getFieldProps("email")}
                        type="email"
                        placeholder="Enter email"
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-neutral-100"
                            }`}
                    />
                    {formik.errors.email && formik.touched.email && (
                        <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                    )}
                </div>
                <button type="submit" className="bg-blue-500 text-white py-2 px-3 rounded-lg cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed" disabled={isSubmitting}>
                    {isSubmitting ? "Sending" : "Send"}
                </button>
            </form>
        </div>
    )
}

export default ForgotPassword;