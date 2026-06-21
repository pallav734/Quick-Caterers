import { useEffect } from "react";
import { useAuth } from "../components/context/AuthContext";
import { deleteUser, getUsers, toggleUserStatusApi } from "../api/userApi";
import LayOut from "../components/layout/Layout";
import { Users as UsersIcon, Pencil, Trash2,Eye } from "lucide-react";
import { useState } from "react";
import AddUserModal from "../users/AddUserModal";
import EditUserModal from "../users/EditUserModal";
import toast from "react-hot-toast";
import DeleteConfirmModal from "../users/DeleteConfirmModal";
import { Link } from "react-router-dom";



/* ROLE COLORS */
const roleColor = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  SUB_ADMIN: "bg-emerald-100 text-emerald-700",
  COMPANY_ADMIN: "bg-blue-100 text-blue-700",
};

/* STATUS COLORS */
const statusColor = {
  true: "bg-emerald-100 text-emerald-700",
  false: "bg-red-100 text-red-700",
};

const Users = ()=>{
    const {user} = useAuth();
    const [open, setOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [usersData, setUsersData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [page,setPage] = useState(1);
    const [totalPages,setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("active");
    const [viewUser, setViewUser] = useState(null);
    const tabs = [
    { label: "Active", value: "active" },
    { label: "In-Active", value: "inactive" },
  ];

    //Fetch Users
    useEffect(()=>{
        const fetchUsers= async()=>{
            try {
                setLoading(true);
                const res = await getUsers({page , limit:10, search , status});
                setUsersData(res.data?.users || []);
                setTotalPages(res.data?.totalPages || 1);
                console.log(res.data);
            } catch (err) {
                setError("Failed to fetch users");
            } finally {
                setLoading(false);
            }
        };
        const delay = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(delay);
    }, [page , search,status]);
        const handleDelete = async () => {
            try {
                setDeleteLoading(true);
                await deleteUser(deleteUserId);
                toast.success("User deleted successfully ");
                if (usersData.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    await refetchUsers();
                }
                setDeleteUserId(null);
            } catch (error) {
                toast.error(error.response?.data?.message || "Delete failed");
            } finally {
                setDeleteLoading(false);
            }
        };
    const handleToggleStatus = async (user) => {
        try {
            // Optimistic UI update (instant feel)
            setUsersData((prev) =>
            prev.map((u) =>
                u._id === user._id ? { ...u, isActive: !u.isActive } : u
            )
            );

            await toggleUserStatusApi(user._id);

            toast.success(
            `User ${user.isActive ? "deactivated" : "activated"}`
            );

        } catch (error) {
            toast.error("Failed to update status");
            refetchUsers();
        }
        };    
    /* Manual refetch*/
        const refetchUsers = async () => {
            const res = await getUsers({
            page,
            limit: 10,
            search,
            status
        });
        setUsersData(res.data?.users || []);
        setTotalPages(res.data?.totalPages || 1);
    };
    const users = usersData;
    const filteredUsers = users;
    return(
        <LayOut>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <UsersIcon size={24} />
                    Users Management
                </h1>
                </div>
                <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
                    <input
                        type="text"
                        placeholder="Search by name or email or mobile..."
                        value={search}
                        onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                        }}
                        className="form-control border px-4 py-2 rounded-lg w-full md:w-64"
                        style={{ maxWidth: "250px" }}
                    />

                    <button
                        disabled={user?.role !== "SUPER_ADMIN"}
                        onClick={() => setOpen(true)}
                        className="bg-indigo-600 disabled:bg-gray-300 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg ml-5"
                    >
                        + Add User
                    </button>
                </div>
            </div>
            <div className="flex gap-4 mb-4 ">
                {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                    }}
                    className={`px-4 py-2 font-medium border-b-2 ${
                    status === tab.value
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500"
                    }`}
                >
                    {tab.label}
                </button>
                ))}
            </div>
            {/* LOADING */}
            {loading && <p className="text-center py-10">Loading users...</p>}

             {/* EMPTY STATE */}
            {!loading && filteredUsers.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <p className="text-slate-500 font-medium">
                    No users found
                </p>
                </div>
            )}
            {/* TABLE */}
            {!loading && filteredUsers.length > 0 && (
                <div className="hidden md:block w-full overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                    <tr className="text-left text-slate-600">
                        <th className="p-4">Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Address</th>
                        <th>Role</th>
                        <th>Status</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredUsers.map((u) => (
                        <tr key={u._id} className="border-b hover:bg-slate-50">
                        <td className="p-4">
                            <button
                                onClick={() => setViewUser(u)}
                                className="font-medium text-indigo-600 hover:underline"
                            >
                                {u.name}
                            </button>
                        </td>
                        <td className="text-slate-600">{u.email}</td>
                        <td className="text-slate-600">{u.mobile}</td>
                        <td className="text-slate-600">{u.address}</td>

                        <td>
                            <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColor[u.role]}`}
                            >
                            {u.role}
                            </span>
                        </td>

                        <td>
                            <div className="flex items-center gap-3">
                                
                                

                                {/* ✅ TOGGLE SWITCH */}
                                 <button
                                    onClick={() => handleToggleStatus(u)}
                                    className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                                    u.isActive ? "bg-green-500" : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                                        u.isActive ? "translate-x-8" : "translate-x-0"
                                    }`}
                                    />
                                </button>

                                {/* EDIT */}
                                <button
                                onClick={() => setEditUser(u)}
                                className="p-1 rounded hover:bg-slate-100"
                                >
                                <Pencil size={16} />
                                </button>

                                {/* DELETE */}
                                <button
                                onClick={() => setDeleteUserId(u._id)}
                                className="p-1 rounded hover:bg-red-100 text-red-600"
                                >
                                <Trash2 size={16} />
                                </button>

                            </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                    <div className="flex justify-center items-center gap-2 mt-6 mb-4 w-[100%]">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((prev) => prev - 1)} 
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                        Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`px-3 py-1 rounded ${
                                    page === i + 1
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-200"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage((prev) => prev + 1)}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
                
            )} 

           {/* VIEW USER MODAL */}
                {viewUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

                    {/* HEADER */}
                    <div className="flex items-center justify-between px-6 py-5 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
                        
                        <div className="flex items-center gap-3 text-white">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Eye size={22} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">
                            View User
                            </h2>

                            <p className="text-sm text-indigo-100">
                            User profile information
                            </p>
                        </div>
                        </div>

                        <button
                        onClick={() => setViewUser(null)}
                        className="text-white text-2xl hover:opacity-80"
                        >
                        ×
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="p-6">

                        {/* PROFILE */}
                        <div className="flex flex-col items-center text-center">

                        <img
                            src={
                            viewUser.profileImage ||
                            "https://ui-avatars.com/api/?name=" +
                                viewUser.name
                            }
                            alt={viewUser.name}
                            className="w-28 h-28 rounded-full object-cover border-4 border-indigo-100 shadow-md"
                        />

                        <h3 className="text-2xl font-bold text-slate-800 mt-4">
                            {viewUser.name}
                        </h3>

                        <p className="text-slate-500">
                            {viewUser.email}
                        </p>

                        <span
                            className={`mt-3 px-4 py-1 rounded-full text-xs font-semibold ${
                            roleColor[viewUser.role]
                            }`}
                        >
                            {viewUser.role}
                        </span>
                        </div>

                        {/* DETAILS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">

                        <div className="bg-slate-50 rounded-2xl p-4 border">
                            <p className="text-xs text-slate-500 mb-1">
                            Mobile
                            </p>

                            <h4 className="font-semibold text-slate-800">
                            {viewUser.mobile || "N/A"}
                            </h4>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border">
                            <p className="text-xs text-slate-500 mb-1">
                            Status
                            </p>

                            <h4
                            className={`font-semibold ${
                                viewUser.isActive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                            >
                            {viewUser.isActive
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </h4>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border md:col-span-2">
                            <p className="text-xs text-slate-500 mb-1">
                            Address
                            </p>

                            <h4 className="font-semibold text-slate-800">
                            {viewUser.address || "N/A"}
                            </h4>
                        </div>

                        </div>

                        {/* EDIT BUTTON */}
                        <div className="mt-8 flex justify-end">

                        <button
                            onClick={() => {
                            setEditUser(viewUser);
                            setViewUser(null);
                            }}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl shadow-md"
                        >
                            <Pencil size={18} />

                            Edit User
                        </button>

                        </div>

                    </div>
                    </div>
                </div>
                )}   

            {/* Modals */}
            <AddUserModal
                open={open}
                setOpen={setOpen}
                refetch={refetchUsers}
           />
           <EditUserModal 
                user={editUser}
                onClose={() => setEditUser(null)}
                refetch={refetchUsers}
           />
           <DeleteConfirmModal
                open={!!deleteUserId}
                setOpen={() => setDeleteUserId(null)}
                onConfirm={handleDelete}
                loading={deleteLoading}
                itemName="user"
            />
        </LayOut>
    );
};
export default Users;