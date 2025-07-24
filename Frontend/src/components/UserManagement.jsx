import React, { useState } from 'react';
import AddUserForm from './AddUserForm';

const UserManagement = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Moderator' },
        { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: 'User' }
    ]);
    const [showForm, setShowForm] = useState(false);

    const addUser = (newUser) => {
        setUsers([...users, { ...newUser, id: users.length + 1 }]);
        setShowForm(false);
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
                    <table className="min-w-full border rounded-md shadow-sm">
                        <thead className="bg-blue-100 text-left text-sm font-semibold text-blue-600">
                            <tr>
                                <th className="px-4 py-2 border-b">#</th>
                                <th className="px-4 py-2 border-b">Name</th>
                                <th className="px-4 py-2 border-b">Email</th>
                                <th className="px-4 py-2 border-b">Role</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                            {users.map((user, index) => (
                                <tr key={user.id} className="even:bg-gray-50">
                                    <td className="px-4 py-2 border-b">{index + 1}</td>
                                    <td className="px-4 py-2 border-b">{user.name}</td>
                                    <td className="px-4 py-2 border-b">{user.email}</td>
                                    <td className="px-4 py-2 border-b">{user.role}</td>
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
