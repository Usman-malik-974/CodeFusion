import { useEffect, useState } from "react";
import { getUnassignedUsers } from "../shared/networking/api/questionApi/getUnassignedUsers";
import { getAssignedUsers } from "../shared/networking/api/questionApi/getAssignedUsers";
import { HashLoader } from "react-spinners";
import { assignQuestion } from "../shared/networking/api/questionApi/assignQuestion";
import { unassignQuestion } from "../shared/networking/api/questionApi/unassignQuestion";
import { toast } from "react-toastify";

const AssignQuesToUserView = ({ questionID }) => {
    const [activeSubTab, setActiveSubTab] = useState("assigned");
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [UnAssignedUsers, setUnAssignedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [removingUserId, setRemovingUserId] = useState(null);
    const [assigningUserId, setAssigningUserId] = useState(null);

    const subTabs = [
        { id: "assigned", label: "Assigned" },
        { id: "not-assigned", label: "Not Assigned" },
    ];

    useEffect(() => {
        async function getUsers() {
            if (!questionID) return;
            setIsLoading(true);
            if (activeSubTab == 'assigned') {
                const res = await getAssignedUsers(questionID);
                setIsLoading(false);
                setAssignedUsers(res.users);
                // console.log("Assign: ",res);
            }
            else if (activeSubTab === 'not-assigned') {
                const res = await getUnassignedUsers(questionID);
                setIsLoading(false);
                setUnAssignedUsers(res.users);
                console.log("Unassign: ", res.users);
            }
        }
        getUsers();
    }, [activeSubTab, questionID])

    const handleAssignUser = async (userid) => {
        // console.log(userid, questionID);
        setAssigningUserId(userid);
        const res = await assignQuestion(questionID, userid);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        setUnAssignedUsers(UnAssignedUsers.filter((user) => user.id !== userid));
        toast.success(res.message);
        setAssigningUserId(null);
        // console.log(res);
    }
    const handleRemoveUser = async (userid) => {
        setRemovingUserId(userid);
        const res = await unassignQuestion(questionID, userid);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        setAssignedUsers(assignedUsers.filter((user) => user.id != userid));
        toast.success(res.message);
        setRemovingUserId(null);
        // console.log(res);
    }
    return (
        <div>
            <div className="flex justify-center">
                <h2 className="text-2xl font-semibold mb-4 text-blue-500">Assign to Users</h2>
            </div>

            {/* <p className="text-gray-600 mb-6">
                Here you can select and assign questions to specific users.
            </p> */}

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

            {/* Content */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <HashLoader color="#3B82F6" size={60} />
                </div>
            )}
            <div className="mt-4">
                {activeSubTab === "assigned" && (
                    <>
                        {isLoading ? null : assignedUsers.length > 0 ? (
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
                                            <th className="px-4 py-3 border-b border-blue-200">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-700">
                                        {assignedUsers.map((user, index) => (
                                            <tr
                                                key={user.id}
                                                className="even:bg-gray-50 hover:bg-blue-50 transition"
                                            >
                                                <td className="px-4 py-3 border-b border-gray-200">{index + 1}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.rollno || "NA"}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.name}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.email}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.course || "NA"}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.session || "NA"}</td>
                                                <td className="px-2 py-3 border-b border-gray-200">
                                                    <button
                                                        onClick={() => handleRemoveUser(user.id)}
                                                        className={`bg-red-500 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-red-600 transition
    ${removingUserId === user.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                                        disabled={removingUserId === user.id}
                                                    >
                                                        {removingUserId === user.id ? "Removing..." : "Remove"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <h3 className="text-center text-2xl text-gray-400 mt-6">
                                Not assigned to anyone yet
                            </h3>
                        )}
                    </>
                )}

                {activeSubTab === "not-assigned" && (
                    <>
                        {isLoading ? null : UnAssignedUsers.length > 0 ? (
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
                                            <th className="px-4 py-3 border-b border-blue-200">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-700">
                                        {UnAssignedUsers.map((user, index) => (
                                            <tr
                                                key={user.id}
                                                className="even:bg-gray-50 hover:bg-blue-50 transition"
                                            >
                                                <td className="px-4 py-3 border-b border-gray-200">{index + 1}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.rollno || "NA"}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.name}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.email}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.course || "NA"}</td>
                                                <td className="px-4 py-3 border-b border-gray-200">{user.session || "NA"}</td>
                                                <td className="px-2 py-3 border-b border-gray-200">
                                                    <button
                                                        onClick={() => handleAssignUser(user.id)}
                                                        className={`bg-green-600 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-green-700 transition
    ${assigningUserId === user.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                                        disabled={assigningUserId === user.id}
                                                    >
                                                        {assigningUserId === user.id ? "Assigning..." : "Assign"}
                                                    </button>

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <h3 className="text-center text-2xl text-gray-400 mt-6">
                                Not assigned to anyone yet
                            </h3>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default AssignQuesToUserView;
