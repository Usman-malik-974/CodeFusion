import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AboutTeam from "../components/AboutTeam";
import { motion } from "framer-motion"; // 👈 for scroll animations
import { FaArrowRight } from "react-icons/fa";

const Home = () => {
    const navigate = useNavigate();
    const aboutRef = useRef(null);

    const scrollToAbout = () => {
        aboutRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const hero = document.getElementById("hero");
        const img = new Image();
        img.src = "/Home-bg.jpg"; // your actual heavy image

        img.onload = () => {
            hero.style.backgroundImage = `url(${img.src})`;
            hero.classList.remove("opacity-0");
            hero.classList.add("opacity-100");
        };
    }, []);

    return (
        <div className="w-full">
            {/* Header */}
            <header className="text-blue-500 bg-steal-50 flex items-center justify-between px-2 md:px-4 lg:px-6 md:py-1 lg:py-2">
                <h2 className="font-bold text-xl md:text-2xl lg:text-3xl xl:text-4xl">
                    CodeFusion
                </h2>
                <div className="flex items-center gap-1 md:gap-2 lg:gap-3 xl:gap-4">
                    <span
                        className="font-semibold text-sm md:text-sm lg:text-lg xl:text-xl hover:text-black cursor-pointer"
                        onClick={() => navigate("/playground")}
                    >
                        Playground
                    </span>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-500 text-white px-2 py-1 my-1 text-sm md:text-sm lg:py-1 lg:text-lg xl:py-1.5 xl:px-3 xl:text-xl rounded-md font-bold hover:cursor-pointer"
                    >
                        Login
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            {/* <React.lazy> */}

            {/* <div className="bg-[url('/Home-bg.jpg')] bg-cover bg-center h-screen w-full relative"> */}
            <div
                id="hero"
                className="bg-cover bg-center h-screen w-full relative opacity-0 transition-opacity duration-700"
            >

                <div className="absolute top-[20%] flex flex-col ml-[2%] mr-[2%] md:gap-1.5 lg:gap-3 xl:gap-5">
                    <h2 className="text-blue-500 font-bold text-2xl md:text-5xl lg:text-6xl xl:text-8xl break-words">
                        Shaping Your Success
                    </h2>
                    <p className="md:text-xl lg:text-2xl xl:text-4xl">
                        “Not just a platform — a playground for coders.”
                    </p>

                    {/* Catchy Button */}
                    <button
                        onClick={scrollToAbout}
                        className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md w-fit font-bold px-4 py-2 mt-3 text-sm md:text-lg lg:text-xl xl:text-2xl shadow-slate-400 shadow-md hover:cursor-pointer hover:scale-110 transition-transform duration-300"
                    >
                        Team Fusion
                        <FaArrowRight className="relative top-[2px] transition-transform duration-300 group-hover:translate-x-2" />
                    </button>
                </div>
            </div>

            {/* </React.lazy> */}
            {/* About Section with Fade-in */}
            <motion.div
                ref={aboutRef}
                initial={{ opacity: 0, y: 50 }} // 👈 hidden state
                whileInView={{ opacity: 1, y: 0 }} // 👈 visible state
                transition={{ duration: 0.8, ease: "easeOut" }} // 👈 smooth effect
                viewport={{ once: true }} // animate only once
            >
                <AboutTeam />
            </motion.div>
        </div>
    );
};

export default Home;
