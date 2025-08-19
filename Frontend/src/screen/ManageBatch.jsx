import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUserPlus, FaQuestionCircle, FaLayerGroup } from "react-icons/fa";
import { UserPlus } from "lucide-react";
import { getBatch } from "../shared/networking/api/batchApi/getBatch";
import { getRemainingUsers } from "../shared/networking/api/batchApi/getRemainingUsers";
import { getRemainingQuestions } from "../shared/networking/api/batchApi/getRemainingQuestions";
import { assignBatch } from "../shared/networking/api/batchApi/assignBatch";
import { toast } from "react-toastify";
import { assignQuestions } from "../shared/networking/api/batchApi/assignQuestions";
import { unassignBatch } from "../shared/networking/api/batchApi/unassignBatch";
import { unassignQuestiontoBatch } from "../shared/networking/api/questionApi/unassignQuestiontoBatch";
import { deleteBatch } from "../shared/networking/api/batchApi/deleteBatch";
import { setBatchesList } from "../app/slices/batchesSlice";
import { useSelector, useDispatch } from "react-redux";

const ManageBatch = () => {
    const [batch, setBatch] = useState({});
    const [activeTab, setActiveTab] = useState("users");
    const [searchInput, setSearchInput] = useState("");
    const [searchBy, setSearchBy] = useState("name");
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState(""); // "users" or "questions"
    const [popupSearch, setPopupSearch] = useState("");
    const [unAssignedUsers, setUnAssignedUsers] = useState([]);
    const [unAssignedQuestions, setUnAssignedQuestions] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const batchesList = useSelector((state) => state.batches.batchesList);
    // const [showPopUp,setShowPopUp]=useState(false);
    const location = useLocation();
    const batchID = location.state?.batchID;
    console.log(batchID);

    useEffect(() => {
        const fetchBatch = async () => {
            const res = await getBatch(batchID);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            setBatch(res.batch);
        }
        fetchBatch();
    }, [location.state]);

    const getUnassignedUsers = async () => {
        //api call here
        const res = await getRemainingUsers(batchID);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        setUnAssignedUsers(res.users);
    };

    const getUnassignedQuestions = async () => {
        //api call here
        const res = await getRemainingQuestions(batchID);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        setUnAssignedQuestions(res.questions);
    };

    const openPopup = (type) => {
        setPopupType(type);
        setShowPopup(true);
        setPopupSearch("");
        setSelectedItems([]);
        if (type === "users") {
            getUnassignedUsers();
        } else {
            getUnassignedQuestions();
        }
    };

    const removeUser = async (id) => {
        const res = await unassignBatch(batch.id, id);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        toast.success(res.message);
        setBatch(prev => ({
            ...prev,
            users: prev.users.filter(u => u.id !== id)
        })
        )
    }

    const removeQuestion = async (id) => {
        const res = await unassignQuestiontoBatch(id, batch.id);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        toast.success(res.message);
        setBatch(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== id)
        })
        )
    }

    const handlePopupSearch = (item) => {
        const value = popupSearch.toLowerCase();
        if (!value) return true;
        if (popupType === "users") {
            return (
                item.name.toLowerCase().includes(value) ||
                item.email.toLowerCase().includes(value)
            );
        } else {
            return (
                item.title.toLowerCase().includes(value) ||
                item.difficulty.toLowerCase().includes(value)
            );
        }
    };

    const toggleItemSelection = (item) => {
        const itemId = item.id;
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    // const assignSelectedItems = async () => {
    //     if (popupType === "users") {
    //         const usersToAdd = unAssignedUsers.filter(user =>
    //             selectedItems.includes(user.id)
    //         );
    //         const res = await assignBatch(batch.id, selectedItems);
    //         toast.success(res.message);
    //         setBatch(prev => ({
    //             ...prev,
    //             users: [...prev.users, ...usersToAdd]
    //         }));
    //         setUnAssignedUsers(prev =>
    //             prev.filter(user => !selectedItems.includes(user.id))
    //         );
    //     } else {
    //         const questionsToAdd = unAssignedQuestions.filter(question =>
    //             selectedItems.includes(question.id)
    //         );

    //         const res = await assignQuestions(selectedItems, batch.id);
    //         toast.success(res.message);
    //         setBatch(prev => ({
    //             ...prev,
    //             questions: [...prev.questions, ...questionsToAdd]
    //         }));
    //         setUnAssignedQuestions(prev =>
    //             prev.filter(question => !selectedItems.includes(question.id))
    //         );
    //     }
    //     setShowPopup(false);
    // };


    // Filters for main tables

    const assignSelectedItems = async () => {
        if (selectedItems.length === 0) return;
        if (isAssigning || selectedItems.length === 0) return;
        setIsAssigning(true);
        try {
            if (popupType === "users") {
                const res = await assignBatch(batch.id, selectedItems);
                const { assigned = [], notFound = [], invalidIds = [] } = res.summary;

                const assignedUsers = unAssignedUsers.filter(user =>
                    assigned.includes(user.id)
                );

                // Update batch and user lists
                setBatch(prev => ({
                    ...prev,
                    users: [...prev.users, ...assignedUsers]
                }));

                setUnAssignedUsers(prev =>
                    prev.filter(user => !assigned.includes(user.id))
                );

                // Toasts
                if (notFound.length || invalidIds.length) {
                    toast.warn(
                        `Some users couldn't be assigned:\n` +
                        (notFound.length ? `- Not Found: ${notFound.join(", ")}\n` : "") +
                        (invalidIds.length ? `- Invalid: ${invalidIds.join(", ")}` : "")
                    );
                } else {
                    toast.success(res.message);
                }

            } else {
                const res = await assignQuestions(selectedItems, batch.id);
                const { assigned = [], notFound = [], invalidIds = [] } = res.summary;

                const assignedQuestions = unAssignedQuestions.filter(q =>
                    assigned.includes(q.id)
                );

                // Update batch and question lists
                setBatch(prev => ({
                    ...prev,
                    questions: [...prev.questions, ...assignedQuestions]
                }));

                setUnAssignedQuestions(prev =>
                    prev.filter(q => !assigned.includes(q.id))
                );

                // Toasts
                if (notFound.length || invalidIds.length) {
                    toast.warn(
                        `Some questions couldn't be assigned:\n` +
                        (notFound.length ? `- Not Found: ${notFound.join(", ")}\n` : "") +
                        (invalidIds.length ? `- Invalid: ${invalidIds.join(", ")}` : "")
                    );
                } else {
                    toast.success(res.message);
                }
            }
        } catch (error) {
            toast.error("Something went wrong during assignment.");
            console.error(error);
        } finally {
            setSelectedItems([]);
            setShowPopup(false);
            setIsAssigning(false);
        }
    };


    const handleUserFilter = (user) => {
        if (!searchInput) return true;
        const value = searchInput.toLowerCase();
        switch (searchBy) {
            case "name":
                return user.name.toLowerCase().includes(value);
            case "rollno":
                return user.rollno.toLowerCase().includes(value);
            case "course":
                return user.course.toLowerCase().includes(value);
            case "email":
                return user.email.toLowerCase().includes(value);
            case "session":
                return user.session.toLowerCase().includes(value);
            case "role":
                return user.role?.toLowerCase().includes(value);
            default:
                return true;
        }
    };

    const handleQuestionFilter = (q) => {
        if (!searchInput) return true;
        const value = searchInput.toLowerCase();
        switch (searchBy) {
            case "title":
                return q.title.toLowerCase().includes(value);
            case "difficulty":
                return q.difficulty.toLowerCase().includes(value);
            default:
                return true;
        }
    };

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


    const handleDeleteBatch = async () => {
        if (window.confirm("Are you sure you want to delete?")) {
            try {

                const res = await deleteBatch(batch.id);
                if (res.error) {
                    toast.error(res.error);
                    return;
                }
                toast.success(res.message);
                // const batchesList = useSelector((state) => state.batches.bacthesList);
                dispatch(
                    setBatchesList(batchesList.filter((a) => a.id !== batch.id))
                );
                navigate(-1);
                return;
            }
            catch {
                toast.error("Something went wrong");
            }
        }
        console.log("Aborted");
    }

    const filteredUsers = batch.users?.filter(handleUserFilter) || [];
    const filteredQuestions = batch.questions?.filter(handleQuestionFilter) || [];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{batch.name || "Batch Details"}</h3>

            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-300 mb-4">
                <button
                    onClick={() => { setActiveTab("users"); setSearchInput(""); setSearchBy("name"); }}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === "users" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-blue-500"}`}
                >
                    Users
                </button>
                <button
                    onClick={() => { setActiveTab("questions"); setSearchInput(""); setSearchBy("title"); }}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === "questions" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-blue-500"}`}
                >
                    Questions
                </button>
            </div>

            {/* Search bar + Search By + Buttons */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex w-full md:w-1/2 items-center gap-3">
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === "users" ? "user" : "question"}`}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 w-full"
                        value={searchInput}
                    />
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-medium text-blue-500">Search By</span>
                        <select
                            className="p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                            value={searchBy}
                            onChange={(e) => setSearchBy(e.target.value)}
                        >
                            {activeTab === "users" ? (
                                <>
                                    <option value="name">Name</option>
                                    <option value="rollno">Roll No</option>
                                    <option value="course">Course</option>
                                    <option value="email">Email</option>
                                    <option value="session">Session</option>
                                    <option value="role">Role</option>
                                </>
                            ) : (
                                <>
                                    <option value="title">Title</option>
                                    <option value="difficulty">Difficulty</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                {/* Right Buttons */}
                <div className="flex items-center gap-2">

                    <div className="flex gap-2 items-center">
                        {activeTab === "users" && (
                            <button
                                onClick={() => openPopup("users")}
                                className="flex items-center gap-2 bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-blue-600 transition cursor-pointer"
                            >
                                <UserPlus size={16} />
                                Add User
                            </button>
                        )}
                        {activeTab === "questions" && (
                            <button
                                onClick={() => openPopup("questions")}
                                className="flex items-center gap-2 bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-blue-600 transition cursor-pointer"
                            >
                                <FaQuestionCircle />
                                Add Question
                            </button>
                        )}
                    </div>
                    <button
                        className="flex items-center gap-2 bg-red-500 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-red-600 transition cursor-pointer"
                        onClick={handleDeleteBatch}
                    >
                        <FaLayerGroup size={16} />
                        Delete Batch
                    </button>
                </div>
            </div>
            {/* Tables */}
            {activeTab === "users" && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse rounded-xl overflow-hidden shadow-md">
                        <thead className="bg-blue-100 text-left text-sm font-semibold text-blue-600">
                            <tr>
                                <th className="px-4 py-3 border-b border-blue-200">#</th>
                                <th className="px-4 py-3 border-b border-blue-200">Roll Number</th>
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
                                    <tr key={idx} className="hover:bg-blue-50 transition">
                                        <td className="px-4 py-3 border-b border-gray-200">{idx + 1}</td>
                                        <td className="px-4 py-3 border-b border-gray-200">{user.rollno}</td>
                                        <td className="px-4 py-3 border-b border-gray-200">{user.name}</td>
                                        <td className="px-4 py-3 border-b border-gray-200">{user.email}</td>
                                        <td className="px-4 py-3 border-b border-gray-200">{user.course}</td>
                                        <td className="px-4 py-3 border-b border-gray-200">{user.session}</td>
                                        <td className="px-4 py-3 border-b border-gray-200">
                                            <button className={`bg-red-500 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-red-600 transition`} onClick={() => removeUser(user.id)}>Remove</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === "questions" && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse rounded-xl overflow-hidden shadow-md">
                        <thead className="bg-blue-100 text-left text-sm font-semibold text-blue-600">
                            <tr>
                                <th className="px-4 py-3 border-b border-blue-200">#</th>
                                <th className="px-4 py-3 border-b border-blue-200">Question Title</th>
                                <th className="px-4 py-3 border-b border-blue-200">Tags</th>
                                <th className="px-4 py-3 border-b border-blue-200">Difficulty</th>
                                <th className="px-4 py-3 border-b border-blue-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.length > 0 ? (
                                filteredQuestions.map((q, idx) => (
                                    <tr key={q.id} className="hover:bg-blue-50 transition">
                                        <td className="px-4 py-3 border-b border-gray-200">{idx + 1}</td>
                                        <td className="px-4 py-3 border-b border-gray-200">{q.title}</td>
                                        <td className="px-4 py-3 border-b border-gray-200">
                                            {q.tags.map((tag, tagIndex) => (
                                                <span
                                                    key={tagIndex}
                                                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-semibold"
                                                >
                                                    {tag}
                                                </span>
                                            ))}</td>
                                        <td className="px-4 py-3 border-b border-gray-200">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadgeColor(q.difficulty)}`}>
                                                {q.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 border-b border-gray-200">
                                            <button className={`bg-red-500 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-red-600 transition`} onClick={() => removeQuestion(q.id)}>Remove</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-gray-500">No questions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                        <h2 className="text-lg font-semibold mb-4">
                            {popupType === "users" ? "Add User" : "Add Question"}
                        </h2>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={popupSearch}
                            onChange={(e) => setPopupSearch(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
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
                                        .filter(handlePopupSearch).length > 0 ? (
                                        (popupType === "users" ? unAssignedUsers : unAssignedQuestions)
                                            .filter(handlePopupSearch)
                                            .map((item, idx) => {
                                                const itemId = item.id;
                                                const isSelected = selectedItems.includes(itemId);
                                                return (
                                                    <tr
                                                        key={idx}
                                                        className={`hover:bg-blue-50 cursor-pointer ${isSelected ? 'bg-blue-100' : ''}`}
                                                    >
                                                        {popupType === "users" ? (
                                                            <>
                                                                <td className="p-2">{item.rollno}</td>
                                                                <td className="p-2">{item.name}</td>
                                                                <td className="p-2">{item.email}</td>
                                                                <td className="p-2">{item.course}</td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="p-2">{item.title}</td>
                                                                <td className="p-2">{item.tags.map((tag, tagIndex) => (
                                                                    <span
                                                                        key={tagIndex}
                                                                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-semibold"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}</td>
                                                                <td className="p-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadgeColor(item.difficulty)}`}>
                                                                    {item.difficulty}
                                                                </span></td>
                                                            </>
                                                        )}
                                                        <td className="p-2">
                                                            <button
                                                                onClick={() => toggleItemSelection(item)}
                                                                className={`px-2 py-1 rounded text-sm ${isSelected ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
                                                            >
                                                                {isSelected ? 'Remove' : 'Add'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={popupType === "users" ? 4 : 3}
                                                className="text-center p-4 text-gray-500"
                                            >
                                                No results found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setShowPopup(false)}
                                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={assignSelectedItems}
                                disabled={isAssigning || selectedItems.length === 0}
                                className={`px-4 py-2 rounded-md transition ${selectedItems.length > 0 && !isAssigning ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            >
                                {isAssigning ? "Assigning..." : "Assign Selected"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBatch;