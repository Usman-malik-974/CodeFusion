import { NavLink } from "react-router-dom";

const navLinks = [
  { to: "", label: "Question Bank", end: true },
  { to: "users", label: "User Management" },
  { to: "batches", label: "Batches" },
  { to: "contests", label: "Contests" },
];

const AdminNavbar = () => {
  return (
    <nav className="bg-white shadow-md border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-10 py-4 flex justify-between items-center">
        <h3 className="text-3xl font-bold text-blue-700 tracking-wide">Admin Panel</h3>

        <div className="flex gap-5 text-lg font-medium">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative pb-1 transition-all duration-200
                ${isActive ? "text-blue-700 font-semibold after:scale-x-100" : "text-blue-500 hover:text-blue-700 after:scale-x-0"}
                after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-600
                after:transition-transform after:duration-300 after:origin-left`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
