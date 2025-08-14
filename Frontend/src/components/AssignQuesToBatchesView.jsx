import { useEffect, useState } from "react";
// import { getAssignedBatches } from "../shared/networking/api/questionApi/getAssignedBatches";
// import { getUnassignedBatches } from "../shared/networking/api/questionApi/getUnassignedBatches";
// import { assignQuestionToBatch } from "../shared/networking/api/questionApi/assignQuestionToBatch";
// import { unassignQuestionToBatch } from "../shared/networking/api/questionApi/unassignQuestiontoBatch";
import { getAssignedBatches } from "../shared/networking/api/questionApi/getAssignedBatches";
import { getUnassignedBatches } from "../shared/networking/api/questionApi/getUnassignedBatches";
import { assignQuestiontoBatch } from "../shared/networking/api/questionApi/assignQuestiontoBatch";
import { unassignQuestiontoBatch } from "../shared/networking/api/questionApi/unassignQuestiontoBatch";
import { HashLoader } from "react-spinners";
import { toast } from "react-toastify";

const AssignQuesToBatchesView = ({ questionID }) => {
    const [activeSubTab, setActiveSubTab] = useState("assigned");
    const [assignedBatches, setAssignedBatches] = useState([]);
    const [unAssignedBatches, setUnAssignedBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [removingBatchId, setRemovingBatchId] = useState(null);
    const [assigningBatchId, setAssigningBatchId] = useState(null);

    const subTabs = [
        { id: "assigned", label: "Assigned" },
        { id: "not-assigned", label: "Not Assigned" },
    ];

    useEffect(() => {
        async function getBatches() {
            if (!questionID) return;
            setIsLoading(true);
            if (activeSubTab === "assigned") {
                const res = await getAssignedBatches(questionID);
                setAssignedBatches(res.batches || []);
            } else if (activeSubTab === "not-assigned") {
                const res = await getUnassignedBatches(questionID);
                console.log(res.batches);
                setUnAssignedBatches(res.batches || []);
            }
            setIsLoading(false);
        }
        getBatches();
    }, [activeSubTab, questionID]);

    const handleAssignBatch = async (batchId) => {
        setAssigningBatchId(batchId);
        const res = await assignQuestiontoBatch(questionID, batchId);
        if (res.error) {
            toast.error(res.error);
            setAssigningBatchId(null);
            return;
        }
        setUnAssignedBatches(unAssignedBatches.filter((batch) => batch.id !== batchId));
        toast.success(res.message);
        setAssigningBatchId(null);
    };

    const handleRemoveBatch = async (batchId) => {
        setRemovingBatchId(batchId);
        const res = await unassignQuestiontoBatch(questionID, batchId);
        if (res.error) {
            toast.error(res.error);
            setRemovingBatchId(null);
            return;
        }
        setAssignedBatches(assignedBatches.filter((batch) => batch.id !== batchId));
        toast.success(res.message);
        setRemovingBatchId(null);
    };

    return (
        <div>
            <div className="flex justify-center">
                <h2 className="text-2xl font-semibold mb-4 text-blue-500">Assign to Batches</h2>
            </div>

            {/* Sub Tabs */}
            <nav className="flex gap-6 border-b pb-2">
                {subTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`relative py-1 text-sm font-medium transition-colors duration-300
              ${activeSubTab === tab.id
                                ? "text-blue-600"
                                : "text-gray-600 hover:text-blue-500"
                            }`}
                    >
                        {tab.label}
                        {activeSubTab === tab.id && (
                            <span className="absolute left-0 bottom-0 h-[2px] w-full bg-blue-600 rounded-full transition-all duration-300"></span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Loader */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <HashLoader color="#3B82F6" size={60} />
                </div>
            )}

            {/* Content */}
            <div className="mt-4">
                {activeSubTab === "assigned" && !isLoading && (
                    assignedBatches.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse rounded-xl overflow-hidden shadow-md">
                                <thead className="bg-blue-100 text-left text-sm font-semibold text-blue-600">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-blue-200">#</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Batch Name</th>
                                        <th className="px-4 py-3 border-b border-blue-200">No of Users</th>
                                        <th className="px-4 py-3 border-b border-blue-200">No of Questions</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700">
                                    {assignedBatches.map((batch, index) => (
                                        <tr key={batch.id} className="even:bg-gray-50 hover:bg-blue-50 transition">
                                            <td className="px-4 py-3 border-b border-gray-200">{index + 1}</td>
                                            <td className="px-4 py-3 border-b border-gray-200">{batch.batchName}</td>
                                            <td className="px-4 py-3 border-b border-gray-200">{batch.users.length }</td>
                                            <td className="px-4 py-3 border-b border-gray-200">{batch.assignedQuestions.length }</td>
                                            <td className="px-2 py-3 border-b border-gray-200">
                                                <button
                                                    onClick={() => handleRemoveBatch(batch.id)}
                                                    className={`bg-red-500 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-red-600 transition
        ${removingBatchId === batch.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    disabled={removingBatchId === batch.id}
                                                >
                                                    {removingBatchId === batch.id ? "Removing..." : "Remove"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <h3 className="text-center text-2xl text-gray-400 mt-6">
                            Not assigned to any batch yet
                        </h3>
                    )
                )}

                {activeSubTab === "not-assigned" && !isLoading && (
                    unAssignedBatches.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse rounded-xl overflow-hidden shadow-md">
                                <thead className="bg-blue-100 text-left text-sm font-semibold text-blue-600">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-blue-200">#</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Batch Name</th>
                                        <th className="px-4 py-3 border-b border-blue-200">No of Users</th>
                                        <th className="px-4 py-3 border-b border-blue-200">No of Questions</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700">
                                    {unAssignedBatches.map((batch, index) => (
                                        <tr key={batch.id} className="even:bg-gray-50 hover:bg-blue-50 transition">
                                            <td className="px-4 py-3 border-b border-gray-200">{index + 1}</td>
                                            <td className="px-4 py-3 border-b border-gray-200">{batch.batchName}</td>
                                            <td className="px-4 py-3 border-b border-gray-200">{batch.users.length }</td>
                                            <td className="px-4 py-3 border-b border-gray-200">{batch.assignedQuestions.length }</td>
                                            <td className="px-2 py-3 border-b border-gray-200">
                                                <button
                                                    onClick={() => handleAssignBatch(batch.id)}
                                                    className={`bg-green-600 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-green-700 transition
        ${assigningBatchId === batch.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    disabled={assigningBatchId === batch.id}
                                                >
                                                    {assigningBatchId === batch.id ? "Assigning..." : "Assign"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <h3 className="text-center text-2xl text-gray-400 mt-6">
                            All batches are already assigned
                        </h3>
                    )
                )}
            </div>
        </div>
    );
};

export default AssignQuesToBatchesView;
