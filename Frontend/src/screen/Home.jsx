import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate=useNavigate();
    return (
        <div className="w-full">
            <header className="text-blue-500 bg-steal-50 flex items-center justify-between px-2 md:px-4 lg:px-6 md:py-1 lg:py-2">
                <h2 className="font-bold text-xl md:text-2xl lg:text-3xl xl:text-4xl">CodeFusion</h2>
                <div className="flex items-center gap-1 md:gap-2 lg:gap-3 xl:gap-4">
                    <span className="font-semibold text-sm md:text-sm lg:text-lg xl:text-xl hover:text-black cursor-pointer" onClick={()=>navigate("/playground")}>Playground</span>
                    <button onClick={()=>navigate("/login")} className="bg-blue-500 text-white px-2 py-1 my-1 text-sm md:text-sm lg:py-1 lg:text-lg xl:py-1.5 xl:px-3 xl:text-xl rounded-md text font-bold hover:cursor-pointer">Login</button>
                </div>
            </header>
            <div className="bg-[url('/Home-bg.jpg')] bg-cover bg-center h-screen w-full relative">
                <div className="absolute top-[20%] flex flex-col ml-[2%] mr-[2%] md:gap-1.5 lg:gap-3 xl:gap-5">
                    <h2 className="text-blue-500 font-bold text-2xl md:text-5xl lg:text-6xl xl:text-8xl break-words">Shaping Your Success</h2>
                    <p className="md:text-xl lg:text-2xl xl:text-4xl">“Not just a platform — a playground for coders.”</p>
                    <button className="bg-blue-500 text-white rounded-md w-fit font-bold px-2 py-1 mt-1.5 text-sm md:text-lg md:py-1 md:mt-2 md:px-4 lg:text-xl lg:mt-2 lg:px-4 lg:py-1.5 xl:text-2xl xl:px-4 xl:py-2 xl:mt-5 shadow-slate-400 shadow-md hover:cursor-pointer hover:scale-105">Explore now</button>
                </div>
            </div>
        </div>
    );
}

export default Home;
