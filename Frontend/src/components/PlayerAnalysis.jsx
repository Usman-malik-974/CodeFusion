import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUserPerformance } from "../shared/networking/api/contestApi/getUserPerformance";
import HashLoader from "react-spinners/HashLoader";
import { FcExpand } from "react-icons/fc";
import React from "react";

const PlayerAnalysis = ({ playerAnalysisData }) => {
    const { userId, contestId } = playerAnalysisData;
    const [isLoading, setIsLoading] = useState(false);
    const [playerData, setPlayerData] = useState([]);
    const [expandingId, setExpandingId] = useState(null); // track which row is expanded
    const [viewingCode, setViewingCode] = useState(null);

    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                setIsLoading(true);
                const res = await getUserPerformance(contestId, userId);
                if (res.error) {
                    toast.error(res.error);
                    return;
                }
                setPlayerData(res);
            } catch (e) {
                toast.error("Something Went Wrong");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlayerData();
    }, [contestId, userId]);

    const getDifficultyBadgeColor = (level) => {
        switch (level) {
            case "Easy":
                return "bg-green-100 text-green-700 border border-green-300";
            case "Medium":
                return "bg-amber-100 text-amber-700 border border-amber-300";
            case "Hard":
                return "bg-red-100 text-red-700 border border-red-300";
            default:
                return "bg-gray-100 text-gray-700 border border-gray-300";
        }
    };

    return (
        <div className="p-4 relative">
            <h3 className="text-3xl text-blue-500 font-semibold text-center mb-6">
                User Performance
            </h3>

            <div className="w-full bg-white shadow-xl rounded-2xl overflow-hidden">
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <HashLoader color="#3B82F6" size={60} />
                    </div>
                )}

                {!isLoading && (
                    <table className="min-w-full text-left border-collapse rounded-xl shadow-md">
                        <thead className="bg-blue-100 text-blue-600 text-sm font-semibold">
                            <tr>
                                <th className="px-4 py-3">Sr No</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Difficulty</th>
                                <th className="px-4 py-3">Total Marks</th>
                                <th className="px-4 py-3">Submissions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {playerData.length > 0 ? (
                                playerData.map((q, idx) => (
                                    <React.Fragment key={q.questionId}>
                                        {/* Main row */}
                                        <tr
                                            className={`${idx % 2 === 0 ? "bg-blue-50" : "bg-white"
                                                } hover:bg-blue-100 transition`}
                                        >
                                            <td className="px-4 py-3">{idx + 1}</td>
                                            <td className="px-4 py-3">{q.title}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyBadgeColor(
                                                        q.difficulty
                                                    )}`}
                                                >
                                                    {q?.difficulty || "Unknown"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{q.maxMarks}</td>
                                            <td className="px-4 py-3 flex items-center gap-2">
                                                <span>{q.submissions.length}</span>
                                                <button
                                                    className="p-2 rounded-full"
                                                    title="Expand"
                                                    onClick={() =>
                                                        setExpandingId(
                                                            expandingId === q.questionId ? null : q.questionId
                                                        )
                                                    }
                                                >
                                                    <FcExpand className="text-xl transition-transform duration-300" />
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded row */}
                                        {expandingId === q.questionId && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={5} className="px-4 py-3">
                                                    {/* <div className="p-4 border rounded-lg bg-white shadow-sm"> */}
                                                    {/* <h4 className="font-semibold mb-2">Submissions Details:</h4> */}
                                                    {q.submissions.length > 0 ? (
                                                        <div className='max-h-96 overflow-y-auto border rounded-md'>
                                                        <table className="w-full text-left border-collapse">
                                                            <thead className="bg-blue-100 text-blue-600 text-sm font-semibold">
                                                                <tr>
                                                                    <th className="px-4 py-2">Language</th>
                                                                    <th className="px-4 py-2">Time</th>
                                                                    <th className="px-4 py-2">Passed</th>
                                                                    <th className="px-4 py-2">Obtained Marks</th>
                                                                    <th className="px-4 py-2">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {q.submissions.map((sub, i) => {
                                                                    const allPassed = sub.passed === sub.total;
                                                                    return (
                                                                        <tr
                                                                            key={i}
                                                                            className={`${i % 2 === 0 ? "bg-blue-50" : "bg-white"
                                                                                } hover:bg-blue-100 transition`}
                                                                        >
                                                                            <td className="px-4 py-2">{sub.language}</td>
                                                                            <td className="px-4 py-2">
                                                                                {new Date(sub.submittedAt).toLocaleString()}
                                                                            </td>
                                                                            <td className={`px-4 py-2 text-center font-bold ${allPassed ? "text-green-600" : "text-red-600"}`}>
                                                                                {sub.passed}/{sub.total}
                                                                            </td>
                                                                            <td className={`px-4 py-2 text-center font-bold text-green-600" `}>
                                                                                {sub.obtainedMarks}
                                                                            </td>
                                                                            <td className="px-4 py-3 border-b border-gray-200">
                                                                                <button
                                                                                    className="bg-blue-500 text-white px-2 py-1 rounded"
                                                                                    onClick={() => setViewingCode(sub.code)}
                                                                                >
                                                                                    View Code
                                                                                </button>
                                                                            </td>

                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                            {viewingCode && (
                                                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                                                    <div className="bg-white rounded-xl shadow-lg w-3/4 max-h-[80vh] overflow-auto relative">
                                                                        {/* Header */}
                                                                        <div className="flex justify-between items-center p-4 border-b border-gray-300">
                                                                            <h2 className="text-lg font-bold">Submitted Code</h2>
                                                                            <button
                                                                                className="text-2xl font-bold hover:text-red-500"
                                                                                onClick={() => setViewingCode(null)}
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                        {/* Code Body */}
                                                                        <div className="p-4">
                                                                            <pre className="whitespace-pre-wrap font-mono text-gray-800">
                                                                                {viewingCode}
                                                                            </pre>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                        </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 italic">No submissions</p>
                                                    )}
                                                    {/* </div> */}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-3 text-center text-gray-500 italic"
                                    >
                                        No participants yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PlayerAnalysis;
