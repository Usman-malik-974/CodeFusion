import { useEffect, useState } from "react";

const AssignQuesToUserView = ({ questionID }) => {
    // console.log(questionId);
    const [activeSubTab, setActiveSubTab] = useState("assigned");
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [UnAssignedUsers, setUnAssignedUsers] = useState([]);

    const subTabs = [
        { id: "assigned", label: "Assigned" },
        { id: "not-assigned", label: "Not Assigned" },
    ];

    useEffect(() => {
        // if (!questionId) return; // wait until questionId is available

        console.log("Current questionId:", questionID);

        if (activeSubTab === "assigned") {
            // assigned API call
            console.log(`Fetching assigned users for question ${questionID}`);
        } else if (activeSubTab === "not-assigned") {
            // unassigned API call
            console.log(`Fetching unassigned users for question ${questionID
                
            }`);
        }
    }, [activeSubTab]);

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
            <div className="mt-4">
                {activeSubTab === "assigned" && (
                    <div className="p-3 border rounded bg-white">
                        ✅ List of users who already have this question assigned.
                    </div>
                )}
                {activeSubTab === "not-assigned" && (
                    <div className="p-3 border rounded bg-white">
                        ❌ List of users who do not have this question assigned yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignQuesToUserView;
