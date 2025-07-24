import { Link } from "react-router-dom";
import { NavLink } from 'react-router-dom';
const AdminNavbar = () => {
    return (
        <nav className="flex justify-between px-4 py-2 shadow-md text-blue-500">
            <div>
                <h3 className="text-3xl font-bold">Admin Panel</h3>
            </div>
            <nav className="flex items-center gap-4">
                <NavLink
                    to=""
                    end
                    className={({ isActive }) =>
                        isActive ? "text-gray-600" : "hover:text-black"
                    }
                >
                    Question Bank
                </NavLink>
                <NavLink
                    to="users"
                    className={({ isActive }) =>
                        isActive ? "text-gray-600" : "hover:text-black"
                    }
                >
                    User Management
                </NavLink>
                <NavLink
                    to="batches"
                    className={({ isActive }) =>
                        isActive ? "text-gray-600" : "hover:text-black"
                    }
                >
                    Batches
                </NavLink>
                <NavLink
                    to="contests"
                    className={({ isActive }) =>
                        isActive ? "text-gray-600" : "hover:text-black"
                    }
                >
                    Contest
                </NavLink>
            </nav>
        </nav>
    );

}

export default AdminNavbar;