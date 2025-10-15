import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import { loginUser } from '../shared/networking/api/userApi/loginUser';
import { BiSolidShow, BiSolidHide } from "react-icons/bi";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ForgotPassword from '../components/ForgotPassword';

const Login = () => {
    const [loader, setLoader] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        //api logic to verify if its valid token then redirect acc to role without cred
        //    navigate("/dashboard") or  navigate("/admin")
    }, [])
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
        onSubmit: async (values) => {
            setLoader(true);
            try {
                const res = await loginUser(values.email.trim(), values.password.trim());
                // console.log(res);
                if (res.user) {
                    const userDetails = res.user;
                    const token = res.token; // assuming API returns token
                    localStorage.setItem("token", token);
                    if (userDetails.role === 'admin') {
                        navigate("/admin");
                    }
                    else {
                        navigate("/dashboard");
                    }
                }
                else {
                    // toast.error("Hos");
                    throw new Error(res.error);
                }
            } catch (error) {
                toast.error(error.message || "Login failed");
                // console.error("Login failed", error);
            } finally {
                setLoader(false);
            }
        },
        validateOnChange: false
    });

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
            {showForgotPasswordForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">

                    <ForgotPassword
                        onClose={() => setShowForgotPasswordForm(false)}
                    />
                </div>
            )}
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

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full p-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-neutral-100"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                            >
                                {showPassword ? <BiSolidHide size={20} /> : <BiSolidShow size={20} />}
                            </button>
                        </div>

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
                    <button className="text-blue-500 text-sm hover:underline"
                        onClick={() => setShowForgotPasswordForm(true)}
                    >
                        Forgot Password?
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
