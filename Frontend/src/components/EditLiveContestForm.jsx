import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { updateContestTime } from "../shared/networking/api/contestApi/updateContestTime";
import { time } from "framer-motion";

const validationSchema = Yup.object({
    time: Yup.number()
        .required("Duration is required")
        .positive("Duration must be a positive number")
        .integer("Duration must be an integer"),
});

const EditLiveContestForm = ({ onClose, contestId, onLiveUpdateTime}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formik = useFormik({
        initialValues: {
            time: "",
        },
        validationSchema,
        validateOnChange: false,
        onSubmit: async (values, { resetForm }) => {
            setIsSubmitting(true);
            // console.log(contestId);
            const res = await updateContestTime({
                contestId,
                minutes: values.time
            });
            if (res.error) {
                toast.error(res.error);
                return;
            }
            toast.success(res.message);
            resetForm(); // optional
            setIsSubmitting(false);
            onLiveUpdateTime(contestId,values.time);
            onClose();
        },
    });

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
                Update Live Contest
            </h2>

            <form className="space-y-5" onSubmit={formik.handleSubmit}>
                {/* Time Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add Time (in minutes)
                    </label>
                    <input
                        {...formik.getFieldProps("time")}
                        type="number"
                        placeholder="Enter duration"
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${formik.errors.time ? "border-red-500" : "border-gray-300"
                            }`}
                    />
                    {formik.errors.time && (
                        <p className="text-red-500 text-sm mt-1">{formik.errors.time}</p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    {/* <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button> */}
                    <button
                        type="submit"
                        className={`px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md disabled:cursor-not-allowed disabled:bg-blue-400`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? `Adding...` : `Add Time`}

                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditLiveContestForm;
