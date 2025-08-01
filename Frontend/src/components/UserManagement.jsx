import React, { useState, useEffect,useCallback } from 'react';
import AddUserForm from './AddUserForm';
import { toast } from 'react-toastify';
import { getAllUsers } from '../shared/networking/api/userApi.js/getAllUsers';
import { updateUser } from '../shared/networking/api/userApi.js/updateUser';
import { deleteUser } from '../shared/networking/api/userApi.js/deleteUser';
import { X } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { setUsersList } from "../app/slices/usersSlice";
import { debounce } from 'lodash';
import HashLoader from 'react-spinners/HashLoader';
import { searchUser } from '../shared/networking/api/userApi.js/searchUser';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editedUser, setEditedUser] = useState({});
    const [showPopUp, setShowPopUp] = useState(false);
    const [selectedUser, setSelectedUser] = useState({ index: null, id: null });
    const [isLoading, setIsLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const usersList = useSelector((state) => state.users.usersList);
    const dispatch = useDispatch();

    const handleSearchChange = useCallback(
        debounce(async(query) => {
            if (query.trim() !== '') {
                const res=await searchUser(query.trim());
                setUsers(res.users);
            }
            else{
                setUsers(usersList);
            }
        }, 600),
        [usersList] 
    );

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true); // move inside
            try {
                const res = await getAllUsers();
                if (res.error) {
                    toast.error(res.error);
                } else {
                    setUsers(res.users);
                    dispatch(setUsersList(res.users));
                }
            } catch (err) {
                toast.error("Something went wrong");
            } finally {
                setIsLoading(false); // stop loader only after fetch completes
            }
        };
        if (usersList.length === 0) {
            fetchUsers();
        } else {
            setUsers(usersList);
        }
    }, []);




    const addUser = (newUser) => {
        setUsers([...users, { ...newUser }]);
        dispatch(setUsersList([...users, newUser]));
        setShowForm(false);
    };

    const handleEditClick = (index) => {
        setEditIndex(index);
        setEditedUser({ ...users[index] });
    };

    const handleSaveClick = async () => {
        const { id, name, ...updateData } = editedUser;
        const trimmedName = name?.trim();

        const nameRegex = /^[A-Za-z0-9 ]+$/;

        if (!trimmedName) {
            toast.error("Name cannot be empty.");
            return;
        }
        if (trimmedName.length < 2) {
            toast.error("Name must be at least 2 characters.");
            return;
        }
        if (trimmedName.length > 50) {
            toast.error("Name cannot exceed 50 characters.");
            return;
        }
        if (!nameRegex.test(trimmedName)) {
            toast.error("Name can only contain letters, numbers, and spaces.");
            return;
        }
        console.log(id);
        const result = await updateUser(id, { ...updateData, name: trimmedName, fullname: trimmedName });

        if (result.error) {
            toast.error(result.error);
            return;
        }
        // console.log(result.updatedUser);
        const updatedUsers = [...users];
        updatedUsers[editIndex] = result.updatedUser || { ...editedUser, name: trimmedName };
        setUsers(updatedUsers);
        dispatch(setUsersList(updatedUsers));

        setEditIndex(null);
        setEditedUser({});
        toast.success(result.message || "User updated successfully.");
    };


    const handleDelete = async (index, id) => {
        const result = await deleteUser(id);
        if (result.error) {
            toast.error(result.error);
            return;
        }
        const updatedUsers = users.filter((_, i) => i !== index);
        setUsers(updatedUsers);
        dispatch(setUsersList(updatedUsers));
        toast.success(result.message);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchInput(value); // update input state

        if (value.trim() === "") {
            // If search is cleared, reset to full users list from Redux
            setUsers(usersList);
        } else {
            // Filter based on lowercase match
            const filtered = usersList.filter((user) =>
                user.name.toLowerCase().includes(value.toLowerCase())
            );
            setUsers(filtered);
        }
    };

    return (
        <div className="p-4 relative">
            <h3 className="text-3xl text-blue-500 font-semibold text-center mb-6">User Management</h3>
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <HashLoader color="#3B82F6" size={60} />
                </div>
            )}
                <div className="flex items-center justify-between mb-4">
                    <input
                        type="text"
                        placeholder="Search user"
                        onChange={(e)=>{handleSearchChange(e.target.value)}}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 w-1/3"
                        value={searchInput}
                        onChange={handleSearch}
                    />
                    <button
                        className="bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-blue-600 transition"
                        onClick={() => setShowForm(true)}
                    >
                        Add User +
                    </button>
                </div>

            {isLoading ? null :
                users.length > 0 ? (
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
                                    <tr key={index} className="even:bg-gray-50 hover:bg-blue-50 transition">
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
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                user.role
                                            )}
                                        </td>


                                        <td className="px-2 py-3 border-b border-gray-200">
                                            <div className="flex gap-2 min-w-[110px]">
                                                {editIndex === index ? (
                                                    <>
                                                        <button
                                                            onClick={handleSaveClick}
                                                            className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600 transition"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditIndex(null);
                                                                setEditedUser({});
                                                            }}
                                                            className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs hover:bg-red-200 transition border border-red-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClick(index)}
                                                            className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-600 transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowPopUp(true);
                                                                setSelectedUser({ index, id: user.id });
                                                            }}
                                                            className="bg-red-200 text-red-600 px-3 py-1 rounded-md text-xs hover:bg-red-200 transition border border-red-200"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <h3 className="text-center text-2xl text-gray-400 mt-6">No user to display</h3>
                )
            }


            {
                showForm && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
                        <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                            <AddUserForm onClose={() => setShowForm(false)} onAdd={addUser} />
                        </div>
                    </div>
                )
            }
            {
                showPopUp && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
                        <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
                                <button
                                    onClick={() => { setShowPopUp(false) }}
                                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <h2 className="text-xl font-semibold text-red-400 mb-4 text-center">
                                    Are you Sure?
                                </h2>
                                <div className='flex gap-2 justify-center'>
                                    <button className='bg-red-400 text-white px-3 py-1 rounded-md' onClick={() => setShowPopUp(false)}>No</button>
                                    <button className='bg-blue-500 text-white px-3 py-1 rounded-md' onClick={() => {
                                        handleDelete(selectedUser.index, selectedUser.id);
                                        setShowPopUp(false);
                                    }}>Yes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default UserManagement;
