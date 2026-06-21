import { useState } from "react";
import { useAuth } from "../components/context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import API from "../api/axios";
import { Eye, EyeOff } from "lucide-react";
const Login = () =>{
    const {login ,user} = useAuth();
    const navigate = useNavigate();

    const[email , setEmail] = useState("");
    const[password , setPassword] = useState("");
    const[showPassword , setShowPassword] = useState(false); 

    useEffect(() => {
        if (user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, navigate]);
    const handleLogin = async(e)=>{
        e.preventDefault();
        try {
            const {data} = await API.post("/auth/login" , {
                email,password
            });
            login(data);
            navigate("/dashboard");
        } catch (error) {
            alert("Invalid credentials");
        }
    }
    return(
        <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
      <form
        onSubmit={handleLogin}
        className="
          bg-white dark:bg-slate-900
          p-8 rounded-2xl shadow-xl
          w-full max-w-md
          space-y-5
          border border-slate-200 dark:border-slate-800
        "
      >
        {/* TITLE */}
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
         Quick Caterers Login
        </h1>

        {/* EMAIL */}
        <input
          type="email"
          required
          className="input"
          placeholder="Email address"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD WITH TOGGLE */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            className="input pr-10"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* TOGGLE ICON */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              text-slate-500 hover:text-slate-700
              dark:hover:text-slate-300
              cursor-pointer
            "
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* LOGIN BUTTON */}
        <button
          className="
            w-full bg-indigo-600 hover:bg-indigo-700
            text-white py-2.5 rounded-lg
            font-medium transition cursor-pointer
          "
        >
          Login
        </button>
        <p className="text-sm text-center">
          <NavLink
            to="/forgot-password"
            className="text-indigo-600 hover:underline"
          >
            Forgot Password?
          </NavLink>
        </p>
      </form>
    </div>
    );
}

export default Login;