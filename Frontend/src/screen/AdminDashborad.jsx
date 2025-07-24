import AdminNavbar from "../components/AdminNavbar";
import { Outlet } from "react-router-dom";
const AdminDashboard = () => {
    return (
        <>
            <AdminNavbar />
            {/* <div className="flex justify-center items-center"> */}
                <Outlet />
            {/* </div> */}
        </>
    )
}

export default AdminDashboard;