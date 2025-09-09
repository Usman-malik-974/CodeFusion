import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserMinus, UserPlus } from "lucide-react";
import { FaQuestionCircle, FaLayerGroup } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";

import { getBatch } from "../shared/networking/api/batchApi/getBatch";
import { getRemainingUsers } from "../shared/networking/api/batchApi/getRemainingUsers";
import { getRemainingQuestions } from "../shared/networking/api/batchApi/getRemainingQuestions";
import { assignBatch } from "../shared/networking/api/batchApi/assignBatch";
import { assignQuestions } from "../shared/networking/api/batchApi/assignQuestions";
import { unassignBatch } from "../shared/networking/api/batchApi/unassignBatch";
import { unassignQuestiontoBatch } from "../shared/networking/api/questionApi/unassignQuestiontoBatch";
import { deleteBatch } from "../shared/networking/api/batchApi/deleteBatch";
import { setBatchesList } from "../app/slices/batchesSlice";

import { HashLoader } from "react-spinners";

import { Loader2, Trash2 } from "lucide-react";

const ManageBatch = () => {
    const [batch, setBatch] = useState({});
    const [activeTab, setActiveTab] = useState("users");
    const [searchInput, setSearchInput] = useState("");
    const [searchBy, setSearchBy] = useState("name");

    const [popupVisible, setPopupVisible] = useState(false);
    const [popupType, setPopupType] = useState(""); // "users" or "questions"
    const [popupSearch, setPopupSearch] = useState("");
    const [unAssignedUsers, setUnAssignedUsers] = useState([]);
    const [unAssignedQuestions, setUnAssignedQuestions] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [removingId, setRemovingId] = useState(null); // disables remove button
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const batchID = location.state?.batchID;
    const batchesList = useSelector((state) => state.batches.batchesList);

    // Fetch batch details
    useEffect(() => {
        if (!batchID) return;
        (async () => {
            setIsLoading(true);
            const res = await getBatch(batchID);
            if (res.error) return toast.error(res.error);
            console.log(res.batch);
            setIsLoading(false);
            setBatch(res.batch);
        })();
    }, [batchID]);

    // Fetch unassigned users/questions
    const fetchUnassigned = async (type) => {
        try {
            if (type === "users") {
                const res = await getRemainingUsers(batchID);
                if (res.error) return toast.error(res.error);
                setUnAssignedUsers(res.users);
            } else {
                const res = await getRemainingQuestions(batchID);
                if (res.error) return toast.error(res.error);
                setUnAssignedQuestions(res.questions);
            }
        } catch (err) {
            toast.error("Error fetching unassigned items.");
        }
    };

    // Open popup
    const openPopup = async (type) => {
        setPopupType(type);
        setPopupVisible(true);
        setPopupSearch("");
        setSelectedItems([]);
        await fetchUnassigned(type);
    };

    // Assign selected items
    const assignSelectedItems = async () => {
        if (selectedItems.length === 0 || isAssigning) return;
        setIsAssigning(true);
        try {
            if (popupType === "users") {
                const res = await assignBatch(batch.id, selectedItems);
                const assignedUsers = unAssignedUsers.filter((u) =>
                    res.summary.assigned.includes(u.id)
                );
                setBatch((prev) => ({
                    ...prev,
                    users: [...prev.users, ...assignedUsers]
                }));
                setUnAssignedUsers((prev) =>
                    prev.filter((u) => !res.summary.assigned.includes(u.id))
                );
                toast.success(res.message);
            } else {
                const res = await assignQuestions(selectedItems, batch.id);
                const assignedQuestions = unAssignedQuestions.filter((q) =>
                    res.summary.assigned.includes(q.id)
                );
                setBatch((prev) => ({
                    ...prev,
                    questions: [...prev.questions, ...assignedQuestions]
                }));
                setUnAssignedQuestions((prev) =>
                    prev.filter((q) => !res.summary.assigned.includes(q.id))
                );
                toast.success(res.message);
            }
        } catch (err) {
            toast.error("Assignment failed.");
        } finally {
            setSelectedItems([]);
            setPopupVisible(false);
            setIsAssigning(false);
        }
    };

    // Remove user/question
    const removeItem = async (id, type) => {
        setRemovingId(id);
        try {
            if (type === "users") {
                const res = await unassignBatch(batch.id, id);
                if (res.error) return toast.error(res.error);
                setBatch((prev) => ({
                    ...prev,
                    users: prev.users.filter((u) => u.id !== id)
                }));
            } else {
                const res = await unassignQuestiontoBatch(id, batch.id);
                if (res.error) return toast.error(res.error);
                setBatch((prev) => ({
                    ...prev,
                    questions: prev.questions.filter((q) => q.id !== id)
                }));
            }
            toast.success("Removed successfully");
        } catch (err) {
            toast.error("Failed to remove");
        } finally {
            setRemovingId(null);
        }
    };

    // Delete batch
    const handleDeleteBatch = async () => {
        if (!window.confirm("Are you sure you want to delete?")) return;
        try {
            const res = await deleteBatch(batch.id);
            if (res.error) return toast.error(res.error);
            dispatch(setBatchesList(batchesList.filter((b) => b.id !== batch.id)));
            toast.success(res.message);
            navigate(-1);
        } catch {
            toast.error("Something went wrong.");
        }
    };

    // Toggle selection in popup
    const toggleSelection = (id) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Filter helpers
    const handleSearch = (item) => {
        if (!searchInput) return true;
        const val = searchInput.toLowerCase();
        if (activeTab === "users") {
            return (
                item.name.toLowerCase().includes(val) ||
                item.rollno?.toLowerCase().includes(val) ||
                item.email?.toLowerCase().includes(val) ||
                item.course?.toLowerCase().includes(val) ||
                item.session?.toLowerCase().includes(val) ||
                item.role?.toLowerCase().includes(val)
            );
        } else {
            return (
                item.title.toLowerCase().includes(val) ||
                item.difficulty.toLowerCase().includes(val)
            );
        }
    };

    // Difficulty badge color
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

    // Filtered lists
    const filteredUsers = batch.users?.filter(handleSearch) || [];
    const filteredQuestions = batch.questions?.filter(handleSearch) || [];

    return (
        <div className="p-6">

            {isLoading ?
                <div className="flex justify-center items-center h-130">
                    <HashLoader color="#3B82F6" size={60} />
                </div>
                :
                <div>

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold">{batch.name || "Batch Details"}</h3>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-300 mb-4">
                        <button
                            onClick={() => {
                                setActiveTab("users");
                                setSearchInput("");
                            }}
                            className={`px-4 py-2 font-medium transition-colors cursor-pointer ${activeTab === "users"
                                ? "border-b-2 border-blue-500 text-blue-500"
                                : "text-gray-500 hover:text-blue-500"
                                }`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("questions");
                                setSearchInput("");
                            }}
                            className={`px-4 py-2 font-medium transition-colors cursor-pointer ${activeTab === "questions"
                                ? "border-b-2 border-blue-500 text-blue-500"
                                : "text-gray-500 hover:text-blue-500"
                                }`}
                        >
                            Questions
                        </button>
                    </div>

                    {/* Search + Buttons */}
                    <div className="flex items-center justify-between mb-4">
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}`}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-1/2"
                        />
                        <div className="flex items-center gap-2">
                            {activeTab === "users" && (
                                <button
                                    onClick={() => openPopup("users")}
                                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
                                >
                                    <UserPlus size={16} /> Add User
                                </button>
                            )}
                            {activeTab === "questions" && (
                                <button
                                    onClick={() => openPopup("questions")}
                                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
                                >
                                    <FaQuestionCircle /> Add Question
                                </button>
                            )}
                            <button
                                onClick={handleDeleteBatch}
                                className="flex items-center gap-2 bg-red-400 text-white px-4 py-2 rounded-md hover:bg-red-500 transition cursor-pointer"
                            >
                                <FaLayerGroup /> Delete Batch
                            </button>
                        </div>
                    </div>

                    {/* Tables */}
                    <div className="overflow-x-auto">
                        {activeTab === "users" && (
                            <table className="min-w-full border-collapse rounded-xl shadow-md">
                                <thead className="bg-blue-100 text-left text-sm font-semibold text-blue-600">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-blue-200">#</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Roll No</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Name</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Email</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Course</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Session</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user, idx) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-blue-50 transition"
                                            >
                                                <td className="px-4 py-3 border-b border-gray-200">{idx + 1}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.rollno}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.name}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.email}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.course}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.session}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">
                                                    <button
                                                        onClick={() => removeItem(user.id, "users")}
                                                        disabled={removingId === user.id}
                                                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition shadow-sm cursor-pointer ${removingId === user.id
                                                            ? "bg-red-200 text-red-600 cursor-not-allowed"
                                                            : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                                                    >
                                                        {removingId === user.id ? (
                                                            <>
                                                                <Loader2 size={14} className="animate-spin" />
                                                                Removing...
                                                            </>
                                                        ) : (
                                                            <>

                                                                <Trash2 size={14} />
                                                                Remove
                                                            </>
                                                        )}
                                                    </button>

                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                        {activeTab === "questions" && (
                            <table className="min-w-full border-collapse rounded-xl shadow-md">
                                <thead className="bg-blue-100 text-left text-sm font-semibold text-blue-600">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-blue-200">#</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Title</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Tags</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Difficulty</th>
                                        <th className="px-4 py-3 border-b border-blue-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredQuestions.length > 0 ? (
                                        filteredQuestions.map((q, idx) => (
                                            <tr key={q.id} className="hover:bg-blue-50 transition">
                                                <td className="px-4 py-3 border-b border-gray-200">{idx + 1}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{q.title}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">
                                                    {q.tags.map((tag, i) => (
                                                        <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-semibold mr-1">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </td>
                                                <td className="px-4 py-3 border-b border-gray-200">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadgeColor(q.difficulty)}`}>
                                                        {q.difficulty}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-b border-gray-200">
                                                    <button
                                                        onClick={() => removeItem(q.id, "questions")}
                                                        disabled={removingId === q.id}
                                                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition shadow-sm cursor-pointer ${removingId === q.id
                                                            ? "bg-red-200 text-red-600 cursor-not-allowed"
                                                            : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                                                    >
                                                        {removingId === q.id ? (
                                                            <>
                                                                <Loader2 size={14} className="animate-spin" />
                                                                Removing...
                                                            </>
                                                        ) : (
                                                            <>

                                                                <Trash2 size={14} />
                                                                Remove
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-gray-500">
                                                No questions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Popup for adding users/questions */}
                    {popupVisible && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                                <h2 className="text-lg font-semibold mb-4">{popupType === "users" ? "Add User" : "Add Question"}</h2>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={popupSearch}
                                    onChange={(e) => setPopupSearch(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                {popupType === "users" ? (
                                                    <>
                                                        <th className="p-2 text-left">Roll No</th>
                                                        <th className="p-2 text-left">Name</th>
                                                        <th className="p-2 text-left">Email</th>
                                                        <th className="p-2 text-left">Course</th>
                                                        <th className="p-2 text-left">Action</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="p-2 text-left">Title</th>
                                                        <th className="p-2 text-left">Tags</th>
                                                        <th className="p-2 text-left">Difficulty</th>
                                                        <th className="p-2 text-left">Action</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(popupType === "users" ? unAssignedUsers : unAssignedQuestions)
                                                .filter((item) =>
                                                    popupSearch
                                                        ? popupType === "users"
                                                            ? item.name.toLowerCase().includes(popupSearch.toLowerCase()) ||
                                                            item.email.toLowerCase().includes(popupSearch.toLowerCase())
                                                            : item.title.toLowerCase().includes(popupSearch.toLowerCase())
                                                        : true
                                                )
                                                .map((item) => {
                                                    const isSelected = selectedItems.includes(item.id);
                                                    return (
                                                        <tr key={item.id} className={`hover:bg-blue-50 cursor-pointer ${isSelected ? "bg-blue-100" : ""}`}>
                                                            {popupType === "users" ? (
                                                                <>
                                                                    <td className="p-2">{item.rollno || "NA"}</td>
                                                                    <td className="p-2">{item.name || "NA"}</td>
                                                                    <td className="p-2">{item.email || "NA"}</td>
                                                                    <td className="p-2">{item.course || "NA"}</td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td className="p-2">{item.title}</td>
                                                                    <td className="p-2">{item.tags.map((t, i) => (
                                                                        <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-semibold mr-1">{t}</span>
                                                                    ))}</td>
                                                                    <td className="p-2">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadgeColor(item.difficulty)}`}>{item.difficulty}</span>
                                                                    </td>
                                                                </>
                                                            )}
                                                            <td className="p-2">
                                                                <button
                                                                    onClick={() => toggleSelection(item.id)}
                                                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 shadow-sm
    ${isSelected
                                                                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                                                                            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                                                        }`}
                                                                >
                                                                    {isSelected ? "Remove" : "Add"}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <button onClick={() => setPopupVisible(false)} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 cursor-pointer">Close</button>
                                    <button
                                        onClick={assignSelectedItems}
                                        disabled={selectedItems.length === 0 || isAssigning}
                                        className={`px-4 py-2 rounded-md transition cursor-pointer ${selectedItems.length > 0 && !isAssigning ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                                    >
                                        {isAssigning ? "Assigning..." : "Assign Selected"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            }
        </div>
    );
};

export default ManageBatch;
