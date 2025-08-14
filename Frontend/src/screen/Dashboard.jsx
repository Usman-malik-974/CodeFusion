import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BiLogOut } from "react-icons/bi";
import { getUserQuestions } from "../shared/networking/api/questionApi/getUserQuestions";
import { getUserBatches } from "../shared/networking/api/userApi/getUserBatches";
import { FaQuestionCircle } from "react-icons/fa";
import { HashLoader } from "react-spinners";
import { toast } from "react-toastify";

const Dashboard = () => {
    const navigate = useNavigate();
    //   const user = useSelector((state) => state.auth.user); // Example if you store logged-in user
    const [activeTab, setActiveTab] = useState("questions");
    const [questions, setQuestions] = useState([]);
    const [userBatches, setUserBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const tabs = [
        { id: "questions", label: "Questions" },
        { id: "batches", label: "Batches" },
    ];
    useEffect(() => {
        async function getData() {
            setIsLoading(true);
            if (activeTab == 'questions') {
                // if (questions.length == 0) {
                const res = await getUserQuestions();
                // }
                // console.log("Assign: ", res.questions);
                setIsLoading(false);
                if (res.status && (res.status >= 401 && res.status <= 404)) {
                    toast.error("Unauthorized Access");
                    navigate("/login");
                    return;
                }
                setQuestions(res.questions);
            }
            else if (activeTab === 'batches') {
                const res = await getUserBatches();
                setIsLoading(false);
                if (res.status && (res.status >= 401 && res.status <= 404)) {
                    toast.error("Unauthorized Access");
                    navigate("/login");
                    return;
                }
                setUserBatches(res.batches);
                // console.log("Batches");
            }
        }
        getData();
    }, [activeTab])

    const getDifficultyBadgeColor = (level) => {
        switch (level) {
            case 'Easy':
                return 'bg-green-100 text-green-700';
            case 'Medium':
                return 'bg-amber-200 text-yellow-700';
            case 'Hard':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const handleViewClick = (id) => {
        console.log('View question with ID:', id);
        navigate(`/question`, {
            state: {
                questionData: questions.find((question) => question.id == id)
            }
        });
    };
    return (
        <div className="p-6">
            {/* Welcome */}
            <div className="flex justify-between items-center px-2 mb-2">

                <h1 className="text-2xl font-bold">
                    Welcome, {"User"}
                </h1>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors duration-200 cursor-pointer"
                >
                    <BiLogOut size={22} />
                    <span className="text-base font-medium">Logout</span>
                </button>
            </div>

            {/* Tabs */}
            <nav className="flex gap-8 border-b pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative py-2 px-4 text-sm font-medium transition-colors duration-300 cursor-pointer
              ${activeTab === tab.id
                                ? "text-blue-600"
                                : "text-gray-600 hover:text-blue-500"
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute left-0 bottom-0 h-[2px] w-full bg-blue-600 rounded-full transition-all duration-300"></span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Content */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <HashLoader color="#3B82F6" size={60} />
                </div>
            )}
            <div className="mt-6">
                {activeTab === "questions" && (
                    <div>
                        {isLoading ? null : questions.length > 0 ? (
                            < div className="overflow-x-auto">
                                {/* {filteredQuestions.length > 0 ? ( */}
                                <table className="min-w-full border-collapse rounded-xl overflow-hidden shadow-md">
                                    <thead className="bg-blue-100 text-left text-sm font-semibold text-blue-600">
                                        <tr>
                                            <th className="px-4 py-3 border-b border-blue-200">#</th>
                                            <th className="px-4 py-3 border-b border-blue-200">Title</th>
                                            <th className="px-4 py-3 border-b border-blue-200">Tags</th>
                                            <th className="px-4 py-3 border-b border-blue-200">Difficulty</th>
                                            <th className="px-4 py-3 border-b border-blue-200">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-700">
                                        {questions.map((question, index) => (
                                            <tr key={question.id} className="even:bg-gray-50 hover:bg-blue-50 transition">
                                                <td className="px-4 py-3 border-b border-gray-200 font-semibold">{index + 1}</td>
                                                <td className="px-4 py-3 border-b border-gray-200 font-semibold">{question.title}</td>
                                                <td className="px-4 py-3 border-b border-gray-200 font-semibold">
                                                    <div className="flex flex-wrap gap-2">
                                                        {question.tags.map((tag, tagIndex) => (
                                                            <span
                                                                key={tagIndex}
                                                                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-b border-gray-200 font-semibold">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadgeColor(question.difficulty)}`}>
                                                        {question.difficulty}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-b border-gray-200">
                                                    <div className="flex gap-2 min-w-[110px]">

                                                        <button
                                                            onClick={() => handleViewClick(question.id)}
                                                            className="bg-blue-500 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-blue-600 transition cursor-pointer"
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <h3 className="text-center text-xl text-gray-400 mt-6">No questions found</h3>
                        )}
                    </div>
                )}

                {activeTab === "batches" && (
                    isLoading ? null : (
                        userBatches.length > 0 ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {userBatches.map((batch) => (
                                    <div
                                        key={batch.id}
                                        className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm 
                       flex flex-col items-center text-center cursor-pointer
                       transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-blue-300"
                                        onClick={() => {
                                            navigate("/admin/batch", {
                                                state: { batchID: batch.id },
                                            });
                                        }}
                                    >
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                            {batch.name}
                                        </h4>

                                        <div className="flex gap-3 w-full justify-center">
                                            {/* <div className="flex items-center gap-2 text-gray-700 bg-blue-50 px-5 py-3 rounded-full">
                                                <FaUser className="text-blue-500 text-lg" />
                                                <span className="font-medium">{batch.users.length} Users</span>
                                            </div> */}

                                            <div className="flex items-center gap-2 text-gray-700 bg-green-50 px-5 py-3 rounded-full">
                                                <FaQuestionCircle className="text-green-500 text-lg" />
                                                <span className="font-medium">
                                                    {batch.questionCount || 0} Questions
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <h3 className="text-center text-2xl text-gray-400 mt-6">
                                No Batches to display
                            </h3>
                        )
                    )
                )}

            </div>
        </div>
    );
};

export default Dashboard;
