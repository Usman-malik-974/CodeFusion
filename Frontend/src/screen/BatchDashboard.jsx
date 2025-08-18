import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { FaQuestionCircle } from "react-icons/fa";
import { HashLoader } from "react-spinners";
import { toast } from "react-toastify";
import { getBatchQuestions } from "../shared/networking/api/batchApi/getBatchQuestions";

const BatchDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const batchID = location.state?.batchID;

    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    useEffect(() => {
        async function fetchQuestions() {
            if (!batchID) {
                toast.error("No batch selected");
                navigate("/dashboard");
                return;
            }

            setIsLoading(true);
            const res = await getBatchQuestions(batchID);
            setIsLoading(false);

            if (res.status && res.status >= 401 && res.status <= 404) {
                toast.error("Unauthorized Access");
                navigate("/login");
                return;
            }

            setQuestions(res.questions || []);
        }

        fetchQuestions();
    }, [batchID]);

    const getDifficultyBadgeColor = (level) => {
        switch (level) {
            case "Easy":
                return "bg-green-100 text-green-700";
            case "Medium":
                return "bg-amber-200 text-yellow-700";
            case "Hard":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const handleViewClick = (id) => {
        const question = questions.find((q) => q.id === id);
        navigate("/question", {
            state: {
                questionData: question,
            },
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center px-2 mb-4">
                <h1 className="text-2xl font-bold">Batch Questions</h1>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors duration-200 cursor-pointer"
                >
                    <BiLogOut size={22} />
                    <span className="text-base font-medium">Logout</span>
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <HashLoader color="#3B82F6" size={60} />
                </div>
            ) : (
                <div className="mt-6">
                    {questions.length > 0 ? (
                        <div className="overflow-x-auto">
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
                                                <button
                                                    onClick={() => handleViewClick(question.id)}
                                                    className="bg-blue-500 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-blue-600 transition cursor-pointer"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <h3 className="text-center text-xl text-gray-400 mt-6">No questions in this batch</h3>
                    )}
                </div>
            )}
        </div>
    );
};

export default BatchDashboard;
