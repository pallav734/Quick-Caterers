import { useState } from "react";
import { useParams } from "react-router-dom";
import { getSingleUser, updateUser, uploadProfileImage } from "../api/userApi";
import toast from "react-hot-toast";
import { useEffect } from "react";
import LayOut from "../components/layout/Layout";
import Avatar from "../components/ui/Avatar";
import { useAuth } from "../components/context/AuthContext";

const Profile = () => {
    const {id} = useParams();
    const[user , setUser] = useState(null);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        mobile: "",
        address: "",
        role: "",
    });
    const getUser = async()=>{
        try {
            const {data} = await getSingleUser(id);
            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };
    useEffect(()=>{
            getUser();
    },[id]);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                email: user.email || "",
                password: "",
                mobile: user.mobile || "",
                address: user.address || "",
                role: user.role || "",
            });
        }
    }, [user]);
    const handleImageChange = async (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        // preview
        setPreview(URL.createObjectURL(selected));
        setFile(selected);

        // upload immediately 
        try {
            setLoading(true);
            const { data } = await uploadProfileImage(selected);
            if (data.success) {
                toast.success("Profile image updated");
                // update UI instantly
                setUser(data.user);
                setPreview(null);
                setFile(null);
            }
        } catch (error) {
            toast.error("Image upload failed");
        } finally {
            setLoading(false);
        }
    };
    const handleUpdate = async () => {
        try {
            const { data } = await updateUser(id,form)
            if (data.success) {
                toast.success("Updated successfully");
                setUser(data.user);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };
   
    if (!user) return <p>Loading...</p>;

    return (
        <LayOut>
            <div className="p-6 max-w-5xl mx-auto">
            
            {/* HEADER */}
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
                My Profile
            </h1>

            {/* MAIN CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* LEFT SIDE (AVATAR) */}
                <div className="flex flex-col items-center gap-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-6 md:pb-0">

                {/* IMAGE */}
                <div className="relative">
                    {preview ? (
                    <img
                        src={preview}
                        alt="preview"
                        className="w-24 h-24 rounded-full object-cover"
                    />
                    ) : user?.profileImage ? (
                    <img
                        src={user.profileImage}
                        alt="profile"
                        className="w-24 h-24 rounded-full object-cover"
                    />
                    ) : (
                    <Avatar user={user} size={100} />
                    )}
                </div>

                {/* BUTTON */}
                <label className="text-sm cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    {loading ? "Uploading..." : "Change Photo"}
                    <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    />
                </label>

                {/* USER INFO */}
                <div className="text-center mt-2">
                    <p className="font-semibold text-slate-800 dark:text-white">
                    {user?.name}
                    </p>
                    <p className="text-sm text-slate-500">
                    {user?.email}
                    </p>
                </div>
                </div>

                {/* RIGHT SIDE (FORM) */}
                <div className="md:col-span-2 space-y-5">
                    
                    {/* INPUT GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* NAME */}
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        User Name
                        </label>
                        <input
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                        className="mt-1 w-full border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter name"
                        />
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Email
                        </label>
                        <input
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                        className="mt-1 w-full border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter email"
                        />
                    </div>
                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Password
                        </label>
                        <input
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                        className="mt-1 w-full border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter password"
                        />
                    </div>

                    {/* MOBILE */}
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Mobile
                        </label>
                        <input
                        value={form.mobile}
                        onChange={(e) =>
                            setForm({ ...form, mobile: e.target.value })
                        }
                        className="mt-1 w-full border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter mobile"
                        />
                    </div>

                    {/* ROLE */}
                    <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Role
                        </label>
                        <input
                        value={form.role}
                        onChange={(e) =>
                            setForm({ ...form, role: e.target.value })
                        }
                        className="mt-1 w-full border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter role"
                        />
                    </div>

                    </div>

                    {/* ADDRESS (FULL WIDTH) */}
                    <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Address
                    </label>
                    <input
                        value={form.address}
                        onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                        }
                        className="mt-1 w-full border border-slate-300 dark:border-slate-700 bg-transparent p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter address"
                    />
                    </div>

                    {/* BUTTON */}
                    <div className="flex justify-end pt-4">
                    <button
                        onClick={handleUpdate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition shadow-sm"
                    >
                        Update Profile
                    </button>
                    </div>

                </div>
                </div>
            </div>
            </div>
     </LayOut>
);
}

export default Profile;