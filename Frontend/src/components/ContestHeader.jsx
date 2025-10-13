import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContestTimer from "./ContestTimer";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ContestHeader = ({ contestId, contestName = "Contest Mode", questionTitle }) => {
    const navigate = useNavigate();
    const contestQuestions = useSelector(
        (state) => state.contestQuestions.contestQuestions[contestId] || []
    );

    // 🛡️ Prevent navigation during contest
    //   useEffect(() => {
    //     if (!contestId) return;

    //     const handleBeforeUnload = (e) => {
    //       e.preventDefault();
    //       e.returnValue = "";
    //     };

    //     const handlePopState = () => {
    //       toast.warn("⚠️ You cannot leave during the contest!");
    //       navigate(0);
    //     };

    //     window.addEventListener("beforeunload", handleBeforeUnload);
    //     window.addEventListener("popstate", handlePopState);

    //     return () => {
    //       window.removeEventListener("beforeunload", handleBeforeUnload);
    //       window.removeEventListener("popstate", handlePopState);
    //     };
    //   }, [contestId, navigate]);

    if (!contestId) return null;

    return (
        <>
            {/* 🔹 Fixed Header */}
            <header
                className="fixed top-0 left-0 w-full flex justify-between items-center 
             px-8 py-3 z-50 shadow-md bg-blue-500 text-white border-b border-blue-400 h-[70px]"
            >
                {/* Left Section — Contest Info */}
                <div className="flex flex-col">
                    <h2 className="font-bold text-lg tracking-wide">{contestName}</h2>
                    {questionTitle && (
                        <span className="text-sm text-blue-100">Current: {questionTitle}</span>
                    )}
                </div>

                {/* Middle Section — Timer */}
                <div className="flex flex-col items-center justify-center">
                    <ContestTimer id={contestId} />
                    <span className="text-xs text-blue-100 font-medium mt-1">Contest Timer</span>
                </div>

                {/* Right Section — Questions + Submit */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        {contestQuestions.map((q, index) => (
                            <div
                                key={q._id || index}
                                className="relative group cursor-pointer"
                                onClick={() =>
                                    navigate("/question", {
                                        state: { questionData: q, contestId: contestId },
                                    })
                                }
                            >
                                <div
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                   bg-white text-blue-600 hover:bg-blue-100 transition-all duration-200"
                                >
                                    {index + 1}
                                </div>
                                <span
                                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1
                   opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap"
                                >
                                    {q.title}
                                </span>
                            </div>
                        ))}
                    </div>


                    <button
                        className="bg-white hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md font-semibold shadow-sm transition-all"
                        onClick={() =>
                            toast.info("Contest submission logic can be added here.")
                        }
                    >
                        Submit
                    </button>
                </div>
            </header>

            {/* 🔹 Spacer div so content below isn't hidden */}
            <div className="h-[70px]" />
        </>
    );
};

export default ContestHeader;
