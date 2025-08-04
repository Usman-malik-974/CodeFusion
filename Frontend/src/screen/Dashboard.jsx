import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const Dashboard = () => {
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (!user) {
    //         navigate('/login'); // redirect to login if not logged in
    //     }
    // }, [user, navigate]);

    return (
        <div>
            <h1>User Dashboard</h1>
            {/* {user?.role === 'admin' && (
                <button
                    onClick={() => navigate("/admin")}
                    className="bg-blue-500 px-2 py-2 rounded-md text-white"
                >
                    Admin Panel
                </button>
            )} */}
        </div>
    );
};

export default Dashboard;
