import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { toast } from "react-toastify";
import CustomDropdown from "./CustomDropDown";
import { createContest } from "../shared/networking/api/contestApi/createContest";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
    contestName: Yup.string()
        .trim()
        .required("Contest Name is required")
        .min(3, "Contest Name must be at least 3 characters"),

    code: Yup.string()
        .trim()
        .required("Contest Code is required"),

    startTime: Yup.date()
        .required("Start Time is required")
        .typeError("Invalid date")
        .min(new Date(), "Start Time must be in the future"),

    endTime: Yup.date()
        .required("End Time is required")
        .typeError("Invalid date")
        .min(Yup.ref("startTime"), "End Time must be after Start Time"),

    duration: Yup.number()
        .required("Duration is required")
        .positive("Duration must be a positive number")
        .integer("Duration must be an integer")
        .min(5, "Duration must be at least 5 minutes")
        .max(360, "Duration cannot exceed 6 hours"),
});

const CreateContestForm = ({ onClose, questions, onCreate }) => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            contestName: "",
            code: "",
            startTime: "",
            endTime: "",
            duration: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            // console.log({
            //     ...values,
            //     selectedQuestions,
            // });

            if (selectedQuestions.length == 0) {
                alert("Please select at least one Question");
                return;
            }

            const res = await createContest({
                ...values,
                selectedQuestions,
            });
            if (res.error) {
                toast.error(res.error);
            }
            else {
                console.log(res.contest);
                onCreate(res.contest);
                toast.success(res.message);
            }

            //from here res.contest will be set to the Contest Component
            onClose();
        },
    });

    return (
        <div className="w-full text-gray-900 relative">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="sticky right-0 top-0 float-right text-gray-500 hover:text-red-500 text-2xl font-bold"
            >
                ✖
            </button>

            <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">
                Create Contest
            </h2>

            <form className="space-y-4" onSubmit={formik.handleSubmit}>
                {/* Contest Name */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Contest Name
                    </label>
                    <input
                        {...formik.getFieldProps("contestName")}
                        type="text"
                        placeholder="Enter contest name"
                        className={`w-full px-3 py-2 border ${formik.touched.contestName && formik.errors.contestName
                            ? "border-red-500"
                            : "border-gray-300"
                            } rounded-md focus:ring-2 focus:ring-blue-500`}
                    />
                    {formik.touched.contestName && formik.errors.contestName && (
                        <p className="text-red-500 text-sm mt-1">
                            {formik.errors.contestName}
                        </p>
                    )}
                </div>


                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Contest Code
                    </label>
                    <input
                        {...formik.getFieldProps("code")}
                        type="text"
                        placeholder="Enter contest Code"
                        className={`w-full px-3 py-2 border ${formik.touched.code && formik.errors.code
                            ? "border-red-500"
                            : "border-gray-300"
                            } rounded-md focus:ring-2 focus:ring-blue-500`}
                    />
                    {formik.touched.code && formik.errors.code && (
                        <p className="text-red-500 text-sm mt-1">
                            {formik.errors.code}
                        </p>
                    )}
                </div>

                {/* Questions */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Add Questions
                    </label>

                    <CustomDropdown
                        questions={questions}
                        selectedQuestions={selectedQuestions}
                        onAdd={(qIds) => {
                            // Merge multiple new IDs at once, prevent duplicates
                            const newSelection = [...new Set([...selectedQuestions, ...qIds])];
                            setSelectedQuestions(newSelection);
                        }}
                    />


                    {/* Selected Questions */}
                    <div className="mt-3 space-y-2">
                        {selectedQuestions.map((id) => {
                            const q = questions.find((q) => q.id === id);
                            return (
                                <div
                                    key={id}
                                    className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-md"
                                >
                                    <span>{q?.title}</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedQuestions(selectedQuestions.filter((qid) => qid !== id))
                                        }
                                        className="text-red-500 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* Start Time */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Start Time
                    </label>
                    <input
                        {...formik.getFieldProps("startTime")}
                        type="datetime-local"
                        className={`w-full px-3 py-2 border ${formik.touched.startTime && formik.errors.startTime
                            ? "border-red-500"
                            : "border-gray-300"
                            } rounded-md focus:ring-2 focus:ring-blue-500`}
                    />
                    {formik.touched.startTime && formik.errors.startTime && (
                        <p className="text-red-500 text-sm mt-1">
                            {formik.errors.startTime}
                        </p>
                    )}
                </div>

                {/* End Time */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        End Time
                    </label>
                    <input
                        {...formik.getFieldProps("endTime")}
                        type="datetime-local"
                        className={`w-full px-3 py-2 border ${formik.touched.endTime && formik.errors.endTime
                            ? "border-red-500"
                            : "border-gray-300"
                            } rounded-md focus:ring-2 focus:ring-blue-500`}
                    />
                    {formik.touched.endTime && formik.errors.endTime && (
                        <p className="text-red-500 text-sm mt-1">
                            {formik.errors.endTime}
                        </p>
                    )}
                </div>

                {/* Duration */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Duration (in minutes)
                    </label>
                    <input
                        {...formik.getFieldProps("duration")}
                        type="number"
                        placeholder="60"
                        className={`w-full px-3 py-2 border ${formik.touched.duration && formik.errors.duration
                            ? "border-red-500"
                            : "border-gray-300"
                            } rounded-md focus:ring-2 focus:ring-blue-500`}
                    />
                    {formik.touched.duration && formik.errors.duration && (
                        <p className="text-red-500 text-sm mt-1">
                            {formik.errors.duration}
                        </p>
                    )}
                </div>



                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition"
                >
                    Save Contest
                </button>
            </form>
            {/* </div> */}
        </div>
    );
};

export default CreateContestForm;
