import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const ResetPassword = ()=>{
    const {token} = useParams();
    const navigate = useNavigate();
    const[password , setPassword] = useState("");

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try {
            let {data} = await API.post(`/auth/reset-password/${token}` , {password});
            toast.success(data.message);
            navigate("/login");
        } catch (error) {
           toast.error(data.message) 
        }
    }
    return(
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4 border border-slate-200 dark:border-slate-800"
            >
                <h1 className="text-2xl font-bold text-center">Reset Password</h1>

                <input
                type="password"
                required
                className="input"
                placeholder="New password"
                onChange={(e) => setPassword(e.target.value)}
                />

                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg">
                Reset Password
                </button>
            </form>
        </div>
    );
}
export default ResetPassword;