import React, { useState, useEffect, useCallback, useRef } from 'react';
import AddUserForm from './AddUserForm';
import { toast } from 'react-toastify';
import { getAllUsers } from '../shared/networking/api/userApi/getAllUsers';
import { updateUser } from '../shared/networking/api/userApi/updateUser';
import { deleteUser } from '../shared/networking/api/userApi/deleteUser';
import { X, Upload, UserPlus } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { setUsersList } from "../app/slices/usersSlice";
import { debounce } from 'lodash';
import HashLoader from 'react-spinners/HashLoader';
import { searchUser } from '../shared/networking/api/userApi/searchUser';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editedUser, setEditedUser] = useState({});
    const [showPopUp, setShowPopUp] = useState(false);
    const [selectedUser, setSelectedUser] = useState({ index: null, id: null });
    const [isLoading, setIsLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const inputref = useRef(null);
    const dispatch = useDispatch();
    const usersList = useSelector((state) => state.users.usersList);
    const navigate=useNavigate();

    const handleSearchChange = useCallback(
        debounce(async (query) => {
            if (query.trim() !== '') {
                try {
                    const res = await searchUser(query.trim()); // Backend API call
                    if (res.error) {
                        toast.error(res.error);
                    } else {
                        setUsers(res.users); // Replace displayed users with search results
                    }
                } catch (error) {
                    toast.error("Search failed.");
                }
            } else {
                setUsers(usersList); // Restore full list from Redux
            }
        }, 600),
        [usersList]
    );



    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const res = await getAllUsers();
                console.log(res);
                if(res.status && res.status===403){
                    toast.error("Unauthorized Access");
                    // localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }
                if (res.error) {
                    // console.log("Here");
                    toast.error(res.error);
                    // if (res.error=="Unau")
                } else {
                    dispatch(setUsersList(res.users));
                    setUsers(res.users); // filtered view
                }
            } catch (err) {
                toast.error("Something went wrong");
            } finally {
                setIsLoading(false);
            }
        };

        if (usersList.length === 0) {
            fetchUsers();
        } else {
            setUsers(usersList); // initialize filtered view
        }
    }, []);




    const addUser = (newUser) => {
        console.log(newUser);
        setUsers([...users, { ...newUser }]);
        dispatch(setUsersList([...users, newUser]));
        setShowForm(false);
    };

    const handleEditClick = (index) => {
        setEditIndex(index);
        setEditedUser({
            ...users[index],
            rollno: users[index].rollno || "",
            course: users[index].course || "",
            session: users[index].session || "",
            role: users[index].role || "user",
        });
    };


    const handleSaveClick = async () => {
        const { id, name, ...updateData } = editedUser;
        const trimmedName = name?.trim();

        // validations
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
        if (!/^[A-Za-z0-9 ]+$/.test(trimmedName)) {
            toast.error("Name can only contain letters, numbers, and spaces.");
            return;
        }

        if (editedUser.role === "user") {
            if (!editedUser.rollno) {
                toast.error("Roll number is required.");
                return;
            }
            if (!editedUser.course?.trim()) {
                toast.error("Course is required.");
                return;
            }
            if (!/^\d{4}-\d{4}$/.test(editedUser.session || "")) {
                toast.error("Session must be in the format YYYY-YYYY.");
                return;
            }
        }

        const result = await updateUser(id, { ...updateData, name: trimmedName, fullname: trimmedName });
        if (result.error) {
            toast.error(result.error);
            return;
        }

        // update master redux list
        const updatedMasterList = usersList.map((u) =>
            u.id === id ? result.updatedUser : u
        );
        dispatch(setUsersList(updatedMasterList));

        // re-filter local view based on current search
        if (searchInput.trim() !== "") {
            const filtered = updatedMasterList.filter((u) =>
                u.name.toLowerCase().includes(searchInput.trim().toLowerCase()) ||
                u.email.toLowerCase().includes(searchInput.trim().toLowerCase())
            );
            setUsers(filtered);
        } else {
            setUsers(updatedMasterList);
        }

        toast.success(result.message || "User updated successfully.");
        setEditIndex(null);
        setEditedUser({});
    };



    const handleDelete = async (index, id) => {
        const result = await deleteUser(id);
        if (result.error) {
            toast.error(result.error);
            return;
        }

        const updatedMasterList = usersList.filter((u) => u.id !== id);
        dispatch(setUsersList(updatedMasterList));

        // re-filter
        if (searchInput.trim() !== "") {
            const filtered = updatedMasterList.filter((u) =>
                u.name.toLowerCase().includes(searchInput.trim().toLowerCase()) ||
                u.email.toLowerCase().includes(searchInput.trim().toLowerCase())
            );
            setUsers(filtered);
        } else {
            setUsers(updatedMasterList);
        }

        toast.success(result.message);
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prev) => ({ ...prev, [name]: value }));
    };


    const handleExcelUpload = (e) => {
        const file = e.target.files[0];

        if (!file) {
            toast.error("No file selected.");
            return;
        }

        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel" // .xls
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Only Excel files (.xlsx or .xls) are allowed.");
            e.target.value = null; // Reset file input
            return;
        }

        toast.success(`Uploaded: ${file.name}`);

        ///implemet api logic from here
        // Your Excel parsing or uploading logic can go here
    };
    // const handleSearch = (e) => {
    //     const value = e.target.value;
    //     setSearchInput(value); // update input state

    //     if (value.trim() === "") {
    //         // If search is cleared, reset to full users list from Redux
    //         setUsers(usersList);
    //     } else {
    //         // Filter based on lowercase match
    //         const filtered = usersList.filter((user) =>
    //             user.name.toLowerCase().includes(value.toLowerCase())
    //         );
    //         setUsers(filtered);
    //     }
    // };

    return (
        <div className="p-4 relative">
            <h3 className="text-3xl text-blue-500 font-semibold text-center mb-6">User Management</h3>
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <HashLoader color="#3B82F6" size={60} />
                </div>
            )}
            {!isLoading && (
                <div className="flex items-center justify-between mb-4">
                    <input
                        type="text"
                        placeholder="Search user"
                        onChange={(e) => { let value = e.target.value; setSearchInput(value); handleSearchChange(value) }}
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 w-1/3"
                        value={searchInput}

                    />
                    <div className='flex gap-2 items-center'>
                        <button
                            className="flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-green-700 transition cursor-pointer"
                            onClick={() => inputref.current && inputref.current.click()}
                        >
                            <Upload size={16} />
                            Upload Excel
                        </button>

                        <button
                            className="flex items-center gap-2 bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-blue-600 transition cursor-pointer"
                            onClick={() => setShowForm(true)}
                        >
                            <UserPlus size={16} />
                            Add User
                        </button>

                    </div>
                </div>
            )}


            {isLoading ? null :
                users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse rounded-xl overflow-hidden shadow-md">
                            <thead className="bg-blue-100 text-left text-sm font-semibold text-blue-600">
                                <tr>
                                    <th className="px-4 py-3 border-b border-blue-200">#</th>
                                    <th className="px-4 py-3 border-b border-blue-200">Roll Number</th>
                                    <th className="px-4 py-3 border-b border-blue-200">Name</th>
                                    <th className="px-4 py-3 border-b border-blue-200">Email</th>
                                    <th className="px-4 py-3 border-b border-blue-200">Course</th>
                                    <th className="px-4 py-3 border-b border-blue-200">Session</th>
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
                                                editedUser.role === "admin" ? (
                                                    user.rollno || "NA"
                                                ) : (
                                                    <input
                                                        type="number"
                                                        name="rollno"
                                                        value={editedUser.rollno || ""}
                                                        onChange={handleInputChange}
                                                        className="border px-2 py-1 rounded w-full"
                                                    />
                                                )
                                            ) : (
                                                user.rollno || "NA"
                                            )}
                                        </td>


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
                                                editedUser.role === "admin" ? (
                                                    user.course || "NA"
                                                ) : (
                                                    <select
                                                        name="course"
                                                        value={editedUser.course || ""}
                                                        onChange={handleInputChange}
                                                        className="border px-2 py-1 rounded w-full"
                                                    >
                                                        <option value="" disabled>Select course</option>
                                                        <option value="BCA">BCA</option>
                                                        <option value="MCA">MCA</option>
                                                    </select>
                                                )
                                            ) : (
                                                user.course || "NA"
                                            )}
                                        </td>



                                        <td className="px-4 py-3 border-b border-gray-200">
                                            {editIndex === index ? (
                                                editedUser.role === "admin" ? (
                                                    user.session || "NA"
                                                ) : (
                                                    <input
                                                        type="text"
                                                        name="session"
                                                        placeholder="2021-2024"
                                                        value={editedUser.session || ""}
                                                        onChange={handleInputChange}
                                                        className="border px-2 py-1 rounded w-full"
                                                    />
                                                )
                                            ) : (
                                                user.session || "NA"
                                            )}
                                        </td>



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
                                                            className="bg-green-500 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-green-600 transition cursor-pointer"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditIndex(null);
                                                                setEditedUser({});
                                                            }}

                                                            className="bg-red-100 text-red-600 px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-red-200 transition border border-red-200 cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClick(index)}
                                                            className="bg-blue-500 text-white px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-blue-600 transition cursor-pointer"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowPopUp(true);
                                                                setSelectedUser({ index, id: user.id });
                                                            }}
                                                            className="bg-red-200 text-red-600 px-3 py-1.5 font-semibold rounded-md text-xs hover:bg-red-300 transition border border-red-200 cursor-pointer"
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
                                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition "
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <h2 className="text-xl font-semibold text-red-400 mb-4 text-center">
                                    Are you Sure?
                                </h2>
                                <div className='flex gap-2 justify-center'>
                                    <button className='bg-red-400 text-white px-3 py-1 rounded-md cursor-pointer' onClick={() => setShowPopUp(false)}>No</button>
                                    <button className='bg-blue-500 text-white px-3 py-1 rounded-md cursor-pointer' onClick={() => {
                                        handleDelete(selectedUser.index, selectedUser.id);
                                        setShowPopUp(false);
                                    }}>Yes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            <input type="file" hidden ref={inputref} onChange={handleExcelUpload} />
        </div >
    );
};

export default UserManagement;
