import React, { useState } from 'react';
import AddUserForm from './AddUserForm';
import { toast } from 'react-toastify';

const UserManagement = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Moderator' },
        { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: 'User' }
    ]);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editedUser, setEditedUser] = useState({});

    const addUser = (newUser) => {
        setUsers([...users, { ...newUser, id: users.length + 1 }]);
        setShowForm(false);
    };

    const handleEditClick = (index) => {
        setEditIndex(index);
        setEditedUser({ ...users[index] });
    };

    const handleSaveClick = () => {
        const updatedUsers = [...users];
        updatedUsers[editIndex] = editedUser;
        setUsers(updatedUsers);
        setEditIndex(null);
        setEditedUser({});
    };

    const handleDelete = (index) => {
        const updatedUsers = users.filter((_, i) => i !== index);
        setUsers(updatedUsers);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-4 relative">
            <h3 className="text-3xl text-blue-500 font-semibold text-center mb-6">User Management</h3>

            {users.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                    <input
                        type="text"
                        placeholder="Search user"
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 w-1/3"
                    />
                    <button
                        className="bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-blue-600 transition"
                        onClick={() => setShowForm(true)}
                    >
                        Add User +
                    </button>
                </div>
            )}

            {users.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse rounded-xl overflow-hidden shadow-md">
                        <thead className="bg-blue-100 text-left text-sm font-semibold text-blue-600">
                            <tr>
                                <th className="px-4 py-3 border-b border-blue-200">#</th>
                                <th className="px-4 py-3 border-b border-blue-200">Name</th>
                                <th className="px-4 py-3 border-b border-blue-200">Email</th>
                                <th className="px-4 py-3 border-b border-blue-200">Role</th>
                                <th className="px-4 py-3 border-b border-blue-200">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                            {users.map((user, index) => (
                                <tr key={user.id} className="even:bg-gray-50 hover:bg-blue-50 transition">
                                    <td className="px-4 py-3 border-b border-gray-200">{index + 1}</td>

                                    <td className="px-4 py-3 border-b border-gray-200">
                                        {editIndex === index ? (
                                            <input
                                                name="name"
                                                value={editedUser.name}
                                                onChange={handleInputChange}
                                                className="border px-2 py-1 rounded w-full"
                                            />
                                        ) : (
                                            user.name
                                        )}
                                    </td>

                                    <td className="px-4 py-3 border-b border-gray-200">{user.email}</td>

                                    <td className="px-4 py-3 border-b border-gray-200 capitalize">
                                        {editIndex === index ? (
                                            <select
                                                name="role"
                                                value={editedUser.role}
                                                onChange={handleInputChange}
                                                className="border px-2 py-1 rounded w-full"
                                            >
                                                <option value="User">User</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        ) : (
                                            user.role
                                        )}
                                    </td>


                                    <td className="px-2 py-3 border-b border-gray-200">
                                        <div className="flex gap-2 min-w-[110px]">
                                            {editIndex === index ? (
                                                <button
                                                    onClick={handleSaveClick}
                                                    className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600 transition"
                                                >
                                                    Save
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditClick(index)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-600 transition"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(index)}
                                                className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs hover:bg-red-200 transition border border-red-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>


                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <h3 className="text-center text-2xl text-gray-400 mt-6">No user to display</h3>
            )}

            {showForm && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                        <AddUserForm onClose={() => setShowForm(false)} onAdd={addUser} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
