import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    statement: Yup.string().required('Statement is required'),
    inputFormat: Yup.string().required('Input format is required'),
    outputFormat: Yup.string().required('Output format is required'),
    sampleInput: Yup.string().required('Sample input is required'),
    sampleOutput: Yup.string().required('Sample output is required'),
    tags: Yup.string().required('Tags are required'),
    difficulty: Yup.string().oneOf(['Easy', 'Medium', 'Hard']).required('Difficulty is required'),
    testCases: Yup.array().of(
        Yup.object().shape({
            input: Yup.string().required('Input is required'),
            output: Yup.string().required('Output is required'),
            hidden: Yup.boolean().required('Visibility is required'),
        })
    ).min(1, 'At least one test case is required'),
});

const initialValues = {
    title: '',
    statement: '',
    inputFormat: '',
    outputFormat: '',
    sampleInput: '',
    sampleOutput: '',
    tags: '',
    difficulty: 'Easy',
    testCases: [{ input: '', output: '', hidden: false }],
};

const AddQuestionForm = ({ onSubmit,onClose }) => {
    const formik = useFormik({
        initialValues,
        validationSchema,
        validateOnChange: false,
        // validateOnBlur:false,
        onSubmit: (values, { resetForm }) => {
            const formatted = {
                ...values ,
                tags: values.tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0)
            };
            if (onSubmit) {
                console.log('Question submitted:', formatted);
                onSubmit(formatted);
            } else {
                toast.error('Internal Server Error!');
                onClose();
            }
            resetForm();
        },
    });

    const handleAddTestCase = () => {
        formik.setFieldValue('testCases', [...formik.values.testCases, { input: '', output: '', hidden: false }]);
    };

    const handleRemoveTestCase = (index) => {
        if (formik.values.testCases.length > 1) {
            const updated = [...formik.values.testCases];
            updated.splice(index, 1);
            formik.setFieldValue('testCases', updated);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg text-gray-900">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Add New Question</h2>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="font-semibold">Title</label>
                        <input {...formik.getFieldProps('title')} placeholder="Enter question title"
                            className="w-full p-3 border rounded mt-1" />
                        {formik.touched.title && formik.errors.title && (
                            <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
                        )}
                    </div>

                    {/* Statement */}
                    <div>
                        <label className="font-semibold">Statement</label>
                        <textarea {...formik.getFieldProps('statement')} rows={5}
                            placeholder="Describe the problem statement" className="w-full p-3 border rounded mt-1" />
                        {formik.touched.statement && formik.errors.statement && (
                            <div className="text-red-500 text-sm mt-1">{formik.errors.statement}</div>
                        )}
                    </div>

                    {/* Input/Output Format */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold">Input Format</label>
                            <input {...formik.getFieldProps('inputFormat')} placeholder="Describe input format"
                                className="w-full p-3 border rounded mt-1" />
                            {formik.touched.inputFormat && formik.errors.inputFormat && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.inputFormat}</div>
                            )}
                        </div>
                        <div>
                            <label className="font-semibold">Output Format</label>
                            <input {...formik.getFieldProps('outputFormat')} placeholder="Describe output format"
                                className="w-full p-3 border rounded mt-1" />
                            {formik.touched.outputFormat && formik.errors.outputFormat && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.outputFormat}</div>
                            )}
                        </div>
                    </div>

                    {/* Sample Input/Output */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold">Sample Input</label>
                            <input {...formik.getFieldProps('sampleInput')} placeholder="Provide sample input"
                                className="w-full p-3 border rounded mt-1" />
                            {formik.touched.sampleInput && formik.errors.sampleInput && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.sampleInput}</div>
                            )}
                        </div>
                        <div>
                            <label className="font-semibold">Sample Output</label>
                            <input {...formik.getFieldProps('sampleOutput')} placeholder="Provide sample output"
                                className="w-full p-3 border rounded mt-1" />
                            {formik.touched.sampleOutput && formik.errors.sampleOutput && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.sampleOutput}</div>
                            )}
                        </div>
                    </div>

                    {/* Tags & Difficulty */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold">Tags (comma-separated)</label>
                            <input {...formik.getFieldProps('tags')} placeholder="e.g. arrays, dp, strings"
                                className="w-full p-3 border rounded mt-1" />
                            {formik.touched.tags && formik.errors.tags && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.tags}</div>
                            )}
                        </div>
                        <div>
                            <label className="font-semibold">Difficulty</label>
                            <select {...formik.getFieldProps('difficulty')} className="w-full p-3 border rounded mt-1">
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                            {formik.touched.difficulty && formik.errors.difficulty && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.difficulty}</div>
                            )}
                        </div>
                    </div>

                    {/* Test Cases */}
                    <div>
                        <label className="font-semibold">Test Cases</label>
                        <div className="space-y-4 mt-2">
                            {formik.values.testCases.map((tc, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded shadow space-y-2">
                                    <div className="flex  gap-4">
                                        {/* Input */}
                                        <div>
                                            <input
                                                name={`testCases.${index}.input`}
                                                value={tc.input}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Input"
                                                className="p-2 border rounded"
                                            />
                                            {formik.touched.testCases?.[index]?.input && formik.errors.testCases?.[index]?.input && (
                                                <div className="text-red-500 text-sm mt-1">
                                                    {formik.errors.testCases[index].input}
                                                </div>
                                            )}
                                        </div>

                                        {/* Output */}
                                        <div>
                                            <input
                                                name={`testCases.${index}.output`}
                                                value={tc.output}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Expected Output"
                                                className="p-2 border rounded"
                                            />
                                            {formik.touched.testCases?.[index]?.output && formik.errors.testCases?.[index]?.output && (
                                                <div className="text-red-500 text-sm mt-1">
                                                    {formik.errors.testCases[index].output}
                                                </div>
                                            )}
                                        </div>

                                        {/* Hidden Checkbox */}
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                name={`testCases.${index}.hidden`}
                                                checked={tc.hidden}
                                                onChange={e =>
                                                    formik.setFieldValue(`testCases.${index}.hidden`, e.target.checked)
                                                }
                                                className="p-2 border rounded"
                                            />
                                            <span>Hidden</span>
                                        </label>
                                    </div>

                                    {/* Remove Button */}
                                    {formik.values.testCases.length > 1 && (
                                        <div className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTestCase(index)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove Test Case
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={handleAddTestCase}
                                className="text-blue-600 hover:underline text-sm mt-2">
                                + Add Test Case
                            </button>
                            {/* General testCases array error */}
                            {typeof formik.errors.testCases === 'string' && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.testCases}</div>
                            )}
                        </div>

                        {formik.errors.testCases && typeof formik.errors.testCases === 'string' && (
                            <div className="text-red-500 text-sm mt-1">{formik.errors.testCases}</div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="text-center pt-4">
                        <button type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-200">
                            Submit Question
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddQuestionForm;
