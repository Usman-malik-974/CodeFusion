import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomDropdown from "./CustomDropDown";
import { createContest } from "../shared/networking/api/contestApi/createContest";
import { getContestQuestions } from "../shared/networking/api/contestApi/getContestQuestions";
import React from "react";
import { updateContest } from "../shared/networking/api/contestApi/updateContest";

const validationSchema = Yup.object({
    name: Yup.string()
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

const UpdateContestForm = React.memo(({ onClose, questions, onUpdate, prevData }) => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    // console.log(prevData);
    useEffect(() => {
        // console.log("form rendered due to prev");
        async function getQuestions() {
            let data = await getContestQuestions(prevData.id);
            // console.log(data.questions);
            setSelectedQuestions(() => {
                const questionIds = data.questions.map((q, idx) => {
                    return q.id;
                })
                return questionIds;
            });
        }
        getQuestions();
    }, [prevData])
    useEffect(() => {
        console.log("form rendered duto ques")

    }, [questions])
    useEffect(() => {
        console.log("form rendered dut onUpdate")
    }, [onUpdate])
    useEffect(() => {
        console.log("form rendered du to onclose")
    }, [onClose])

    const formik = useFormik({
        initialValues: {
            name: prevData?.name || "",
            code: prevData?.code || "",
            startTime: prevData?.startTime
                ? new Date(prevData.startTime).toISOString().slice(0, 16)
                : "",
            endTime: prevData?.endTime
                ? new Date(prevData.endTime).toISOString().slice(0, 16)
                : "",
            duration: prevData?.duration || "",
        },
        validationSchema,
        onSubmit: async (values) => {
            const payload = { id: prevData.id, ...values, selectedQuestions };

            console.log(payload);


            const res = await updateContest(payload);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            onUpdate(res.contest);
            toast.success(res.message);
            onClose();
        },
    });

    return (
        <div className="w-full text-gray-900 relative">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-0 right-0 text-gray-500 hover:text-red-500 text-2xl font-bold"
            >
                ✖
            </button>

            <h2 className="text-3xl font-bold mb-6 text-center text-blue-500">
                Update Contest
            </h2>

            <form className="space-y-4" onSubmit={formik.handleSubmit}>
                {/* Contest Name */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Contest Name
                    </label>
                    <input
                        {...formik.getFieldProps("name")}
                        type="text"
                        placeholder="Enter contest name"
                        className={`w-full px-3 py-2 border ${formik.touched.name && formik.errors.name
                            ? "border-red-500"
                            : "border-gray-300"
                            } rounded-md focus:ring-2 focus:ring-blue-500`}
                    />
                    {formik.touched.name && formik.errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                            {formik.errors.name}
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

                {/* Questions */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Add Questions
                    </label>

                    <CustomDropdown
                        questions={questions}
                        selectedQuestions={selectedQuestions}
                        onAdd={(qId) => {
                            if (!selectedQuestions.includes(qId)) {
                                setSelectedQuestions([...selectedQuestions, qId]);
                            }
                        }}
                    />

                    {/* Selected Questions */}
                    <div className="mt-3 space-y-2">
                        {selectedQuestions.map((id) => {
                            const q = questions.find((q) => q.id === id);
                            // console.log("In here "+q)
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
});

export default UpdateContestForm;
