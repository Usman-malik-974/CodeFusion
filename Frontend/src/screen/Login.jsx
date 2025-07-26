import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import { loginUser } from '../shared/networking/api/userApi.js/loginUser';

const Login = () => {
    const [loader, setLoader] = useState(false);
    const navigate = useNavigate();
    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email').required('Email is Required'),
        password: Yup.string().required('Password Required'),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async(values) => {
            setLoader(true);
            console.log(values);
            // Api calling will take place here
            const res=await loginUser(values.email.trim(),values.password.trim());
            console.log(res);
            setTimeout(() => {
                const role = 'admin';
                if (role == 'admin') {
                    navigate("/admin");
                }
                setLoader(false)
            }, 3000)
        },
        validateOnChange: false
    });

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
            <div className="shadow-lg bg-white px-8 py-6 rounded-lg w-full max-w-sm">
                <div className="flex items-center justify-center gap-1 mb-2">
                    <img className="h-10 w-10" src="./Logo_CodeFusion.png" alt="Logo" />
                    <h3 className="text-blue-600 text-3xl font-bold">CodeFusion</h3>
                </div>
                <h4 className="font-semibold text-center text-gray-700 mb-4 text-lg">Login to your Account</h4>

                <form onSubmit={formik.handleSubmit}>
                    <div className="mb-4">
                        <label className="text-blue-500 block mb-1 font-semibold">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-neutral-100"
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className="text-red-400 text-sm mt-1">{formik.errors.email}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="text-blue-500 block mb-1 font-semibold">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-neutral-100"
                        />
                        {formik.touched.password && formik.errors.password && (
                            <p className="text-red-400 text-sm mt-1">{formik.errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loader}
                        className={`w-full flex justify-center items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition duration-200 disabled:py-3 disabled:opacity-70 disabled:cursor-not-allowed`}
                    >{loader ? <BeatLoader color="#ffffff" size={10} /> : 'Login'}
                    </button>
                </form>

                <div className="mt-3 text-right">
                    <Link to="#" className="text-blue-500 text-sm hover:underline">
                        Forgot Password?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
