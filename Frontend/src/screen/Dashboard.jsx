import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BiLogOut } from "react-icons/bi";

const Dashboard = () => {
    const navigate = useNavigate();
    //   const user = useSelector((state) => state.auth.user); // Example if you store logged-in user
    const [activeTab, setActiveTab] = useState("questions");
      const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const tabs = [
        { id: "questions", label: "Questions" },
        { id: "batches", label: "Batches" },
    ];

    return (
        <div className="p-6">
            {/* Welcome */}
            <div className="flex justify-between items-center px-2 mb-2">

                <h1 className="text-2xl font-bold">
                    Welcome, {"User"}
                </h1>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors duration-200"
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
                        className={`relative py-2 px-4 text-sm font-medium transition-colors duration-300
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
            <div className="mt-6">
                {activeTab === "questions" && (
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Your Questions</h2>
                        <p className="text-gray-600">
                            Here you can view and solve questions assigned to you.
                        </p>
                        {/* You can later render a list/table of questions */}
                    </div>
                )}

                {activeTab === "batches" && (
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Your Batches</h2>
                        <p className="text-gray-600">
                            View the batches you are enrolled in and their details.
                        </p>
                        {/* You can later render a batch list */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
