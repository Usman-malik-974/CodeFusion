import { useState } from "react";
import { useLocation } from "react-router-dom";
import AssignQuesToUserView from "../components/AssignQuesToUserView";
import AssignQuesToBatchesView from "../components/AssignQuesToBatchesView";

const AssignQuestion = () => {
    const location = useLocation();
    const questionID = location.state?.questionID;
    console.log(questionID);

    const [activeTab, setActiveTab] = useState("users");

    const tabs = [
        { id: "users", label: "Users" },
        { id: "batches", label: "Batches" },
    ];

    return (
        <div>
            {/* Tab Navigation */}
            <nav className="flex justify-center gap-8 relative mt-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative py-2 px-4 text-sm font-medium transition-colors duration-300
              ${activeTab === tab.id
                                ? "text-blue-600"
                                : "text-gray-600 hover:text-blue-500"
                            }`}
                    >
                        {tab.label}

                        {/* Underline for active tab */}
                        {activeTab === tab.id && (
                            <span className="absolute left-0 bottom-0 h-[2px] w-full bg-blue-600 rounded-full transition-all duration-300"></span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Tab Content */}
            <div className="mt-6 p-4 bg-white shadow-sm rounded-md">
                {activeTab === "users" && (
                    <AssignQuesToUserView questionID={questionID} />
                )}

                {activeTab === "batches" && (
                    <AssignQuesToBatchesView questionID={questionID}/>
                )}
            </div>
        </div>
    );
};

export default AssignQuestion;
