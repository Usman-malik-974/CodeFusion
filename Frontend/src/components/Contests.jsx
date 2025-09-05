import { useState, useEffect } from "react";
import CreateContestForm from "./CreateContestForm";
import { getAllQuestions } from "../shared/networking/api/questionApi/getAllQuestions";
import { useSelector, useDispatch } from "react-redux";

const Contests = () => {
    const [activeTab, setActiveTab] = useState("live");
    const [previousContests, setPreviousContests] = useState([]);
    const [liveContests, setLiveContests] = useState([]);
    const [upcomingContests, setUpcomingContests] = useState([]);
    const [showCreateContestForm, setShowCreateContestForm] = useState(false);
    const [questions, setQuestions] = useState([]);
    const questionsList = useSelector((state) => state.questions.questionsList);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchQuestions = async () => {
            // setIsLoading(true);
            try {
                const res = await getAllQuestions();
                if (res.status && res.status === 403) {
                    toast.error("Unauthorized Access");
                    navigate("/login");
                    return;
                }
                if (res.error) {
                    toast.error(res.error);
                } else {
                    setQuestions(res.questions);
                    // dispatch(setQuestionsList(res.questions));
                }
            } catch (err) {
                toast.error("Something went wrong");
            } finally {
                // setIsLoading(false);
            }
        };
        if (questionsList.length === 0) {
            fetchQuestions();
        } else {
            setQuestions(questionsList);
        }

    }, []);

    return (
        <div className="p-4 relative">
            {/* Modal Overlay for Create Contest */}
            {showCreateContestForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative no-scrollbar">
                        <CreateContestForm
                            onClose={() => setShowCreateContestForm(false)}
                            questions={questions}
                        />
                    </div>
                </div>
            )}


            <h3 className="text-3xl text-blue-500 font-semibold text-center mb-6">
                Contest Management
            </h3>

            <div className="flex items-center justify-between mb-4">
                <button
                    className="bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-blue-600 transition cursor-pointer"
                    onClick={() => setShowCreateContestForm(true)}
                >
                    Create Contest +
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-center gap-8 pb-2">
                <button
                    className={`font-semibold pb-1 ${activeTab === "previous"
                        ? "text-rose-500 border-b-2 border-b-rose-500"
                        : "text-rose-400 hover:text-rose-500"
                        }`}
                    onClick={() => setActiveTab("previous")}
                >
                    Previous
                </button>

                <button
                    className={`font-semibold pb-1 ${activeTab === "live"
                        ? "text-green-500 border-b-2 border-b-green-500"
                        : "text-green-400 hover:text-green-500"
                        }`}
                    onClick={() => setActiveTab("live")}
                >
                    Live
                </button>

                <button
                    className={`font-semibold pb-1 ${activeTab === "upcoming"
                        ? "text-blue-500 border-b-2 border-b-blue-500"
                        : "text-blue-400 hover:text-blue-500"
                        }`}
                    onClick={() => setActiveTab("upcoming")}
                >
                    Upcoming
                </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === "previous" &&
                    previousContests.map((contest, idx) => (
                        <h1 key={idx}>{contest.name}</h1>
                    ))}

                {activeTab === "live" && <h1>Live contests here</h1>}

                {activeTab === "upcoming" && <h1>Upcoming contests here</h1>}
            </div>
        </div>
    );
};

export default Contests;
