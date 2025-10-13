import { useLocation, useNavigate } from "react-router-dom";
import { getContestQuestions } from "../shared/networking/api/contestApi/getContestQuestions";
import { getContestTime } from "../shared/networking/api/contestApi/getContestTime";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MdFullscreen } from "react-icons/md";
import { SiTicktick } from "react-icons/si";
import ContestTimer from "../components/ContestTimer";
import { useDispatch, useSelector } from "react-redux";
import { setContestQuestions } from "../app/slices/contestQuestionsSlice";
import socket from "../shared/soket";
import { submitContest } from "../shared/networking/api/contestApi/submitContest";

const ContestQuestions = () => {
    const location = useLocation();
    const id = location?.state?.id;
    // console.log(id)
    const [questions, setQuestions] = useState([]);


    const [showFullScreenPopup, setShowFullScreenPopup] = useState(false);
    const dispatch = useDispatch();
    const contestQuestions = useSelector((state) => state.contestQuestions.contestQuestions[id] || []);
    const navigate = useNavigate();


    // const goFullScreen = () => {
    //     const elem = document.documentElement;
    //     if (elem.requestFullscreen) {
    //         elem.requestFullscreen();
    //     } else if (elem.webkitRequestFullscreen) { /* Safari */
    //         elem.webkitRequestFullscreen();
    //     } else if (elem.msRequestFullscreen) { /* IE11 */
    //         elem.msRequestFullscreen();
    //     }
    //     sessionStorage.setItem("fullscreen",true);
    // };




    // // Show full screen popup only if contest id exists
    // useEffect(() => {
    //     const isFullscreen=sessionStorage.getItem("fullscreen");
    //     if(isFullscreen){
    //         goFullScreen()
    //         return;
    //     }
    //     if (id) setShowFullScreenPopup(true);

    // }, [id]);

    // 1️⃣ Function to enter fullscreen
    const goFullScreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
            elem.msRequestFullscreen();
        }
        sessionStorage.setItem("fullscreen", "true");
    };

    // 2️⃣ Detect when user exits fullscreen (e.g., presses ESC)
    useEffect(() => {
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                console.log("🚨 User exited fullscreen");
                sessionStorage.removeItem("fullscreen");
                setShowFullScreenPopup(true); // Show popup again if needed
            }
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };
    }, []);

    // 3️⃣ Show popup or go fullscreen on mount/contest start
    useEffect(() => {
        const isFullscreen = sessionStorage.getItem("fullscreen");

        if (isFullscreen) {
            goFullScreen(); // Continue fullscreen if previously active
            return;
        }

        if (id) setShowFullScreenPopup(true); // Ask to go fullscreen
    }, [id]);



    useEffect(() => {
        if (!id) return;
        socket.emit("joinContestRoom", { id });
        // socket.on("contest-time-increased", ({ contestId, addedSeconds }) => {
        //     console.log("Increase by", addedSeconds);
        //     console.log(contestId);
        // })
        // socket.on("contest-ended", ({ contestId }) => {
        //     console.log("Ended ", contestId);
        // })
        return () => {
            socket.emit("leaveContestRoom", { id });
        }
    }, [id]);

    // Fetch questions only if id exists
    useEffect(() => {
        if (!id) return;

        // const existingQuestionsObj = contestQuestions.find(item => item[id]);
        if (contestQuestions.length > 0) {
            // Use questions from Redux if already fetched
            setQuestions(contestQuestions);
            return;
        }

        async function fetchContestQuestions() {
            const result = await getContestQuestions(id);
            if (result.error) {
                toast.error(result.error);
                navigate(-1);
                return;
            }

            // Store in Redux: { [contestId]: questions }
            dispatch(setContestQuestions({ [id]: result.questions }));
            setQuestions(result.questions); // update local state
        }

        fetchContestQuestions();
    }, [id, contestQuestions, dispatch, navigate]);



    if (!id) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-gray-100">
                <h1 className="text-xl font-semibold text-gray-700">
                    No Contest Selected
                </h1>
            </div>
        );
    }

    const handleSubmit = async () => {
        console.log("submitted", id);
        const res = await submitContest(id);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        toast.success(res.message);
        navigate("/feedback");
    }

    return (
        <div className="bg-[url('/Contest.jpg')] bg-cover bg-center h-screen w-full relative flex items-start justify-center">
            {showFullScreenPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-2xl max-w-sm text-center">
                        <p className="text-gray-800 font-semibold text-lg">
                            You need to switch to Full Screen to continue
                        </p>
                        <button
                            onClick={() => {
                                setShowFullScreenPopup(false);
                                goFullScreen();
                            }}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md font-bold hover:bg-green-700 transition-colors duration-200"
                        >
                            <MdFullscreen /> Full Screen
                        </button>
                    </div>
                </div>
            )}

            <ContestTimer id={id} />
            <div className="absolute top-[20%] right-[10%] w-full max-w-lg px-6">
                <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">

                    {/* Questions List */}
                    <div className="p-4 space-y-3">
                        {questions.map((q, idx) => (
                            <div
                                key={q.id}
                                className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <p className="font-medium text-gray-800 flex items-center gap-2">

                                    {idx + 1}. {q.title}
                                    {q.done && (
                                        <SiTicktick className="text-green-500" />
                                    )}
                                </p>
                                <button className="bg-blue-500 text-white px-4 py-1 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                                    onClick={() => navigate('/question', { state: { questionData: q, contestId: id } })}
                                >
                                    Solve
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-start pb-4 pt-2 px-4">
                        <button className="bg-green-600 text-white font-bold px-5 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md cursor-pointer"
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestQuestions;