import { useEffect, useState } from "react";
import { getUnassignedUsers } from "../shared/networking/api/questionApi/getUnassignedUsers";
import { getAssignedUsers } from "../shared/networking/api/questionApi/getAssignedUsers";
import { HashLoader } from "react-spinners";

const AssignQuesToUserView = ({ questionID }) => {
    const [activeSubTab, setActiveSubTab] = useState("assigned");
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [UnAssignedUsers, setUnAssignedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleAssignUser = (userid) => {
        console.log(userid);
    }
    const handleRemoveUser = (userid) => {
        console.log(userid);
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
                                                        className="bg-red-500 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-red-600 transition"
                                                    >
                                                        Remove
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
                                                        className="bg-green-600 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-green-700 transition"
                                                    >
                                                        Assign
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
