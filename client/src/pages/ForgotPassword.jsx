import { useState } from "react"
import API from "../api/axios";

const ForgotPassword = ()=>{
    const[email , setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async(e)=>{
        e.preventDefault();
        setMsg("");
        setError("");
        try {
            const { data } = await API.post("/auth/forgot-password", { email });
            setMsg(data.message);
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong");
        }
    }
    return(
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
        <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4 border border-slate-200 dark:border-slate-800"
        >
            <h1 className="text-2xl font-bold text-center">Forgot Password</h1>

            <input
            type="email"
            required
            className="input"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            />

            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg">
            Send Reset Link
            </button>

            {msg && <p className="text-green-600 text-sm text-center">{msg}</p>}
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </form>
    </div>
    );
}
export default ForgotPassword;