import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { BiSolidShow } from "react-icons/bi";
import { BiSolidHide } from "react-icons/bi";
import { BeatLoader } from "react-spinners";
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { joinContest } from "../shared/networking/api/contestApi/joinContest";

const ContestLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loader, setLoader] = useState(false);
    const { id } = useParams();
    // console.log(id);
    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email').required('Email is Required'),
        password: Yup.string().required('Password Required'),
        code: Yup.string().required("Test Code is Required")
    });
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            code: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoader(true);
            console.log(values);
            const res=await joinContest({
                email:values.email,
                password:values.password,
                contestCode:values.code,
                contestId:id
            })
            if(res.error){
                toast.error(res.error);
            }
            else{
                toast.success(res.message);
                console.log(res);
            }
            // setTimeout(() => {
 
                setLoader(false);
            // }, 5000)
        },
        validateOnChange: false
    });
    return (
        <div className="bg-[url('/Contest.jpg')]  bg-cover bg-center h-screen w-full relative">
            <div className="shadow-2xl shadow-black/40 bg-black/70 backdrop-blur-md border border-white/10 px-8 py-6 rounded-2xl w-full max-w-sm absolute top-10 right-60">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <img className="h-10 w-10" src="./Logo_CodeFusion.png" alt="Logo" />
                    <h3 className="text-blue-500 text-3xl font-bold">CodeFusion</h3>
                </div>
                <h4 className="font-semibold text-center text-gray-200 mb-6 text-lg">
                    Login to Contest
                </h4>

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

                    <div className="mb-4">
                        <label className="text-blue-500 block mb-1 font-semibold">Code</label>
                        <input
                            type="text"
                            name="code"
                            placeholder="Enter test code"
                            value={formik.values.code}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-neutral-100"
                        />
                        {formik.touched.code && formik.errors.code && (
                            <p className="text-red-400 text-sm mt-1">{formik.errors.code}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loader}
                        className={`w-full flex justify-center items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition duration-200 disabled:py-3 disabled:opacity-70 disabled:cursor-not-allowed`}
                    >{loader ? <BeatLoader color="#ffffff" size={10} /> : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ContestLogin;