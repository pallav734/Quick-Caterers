import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {useNavigate} from "react-router-dom";
import { useState } from "react";
import { Menu, LogOut , UsersIcon } from "lucide-react";
import Avatar from "../ui/Avatar";
import { useLocation } from "react-router-dom";

const Topbar = ({setOpen})=>{
    const {theme , setTheme} = useContext(ThemeContext);
    const {user , logout} = useAuth();
    const navigate = useNavigate();

    const [menuOpen , setMenuOpen] = useState(false);
    const location = useLocation();
    const getTitle = (pathname) => {
      if (pathname.startsWith("/profile")) return "My Profile";

      const titles = {
        "/dashboard": "Dashboard",
        "/users": "Users Management",
        "/companies": "Company Management",
        "/services" : "Event Management",
        "/category": "Category Management",
        "/sub-category": "Sub-Category Management",
        "/companies/add": "Add Company",
        "/reports": "Reports",
      };

      return titles[pathname] || "Dashboard";
    };

    const title = getTitle(location.pathname);
  
    const handleLogout = ()=>{
        logout();
        navigate("/login", { replace: true });
    }
    return(
        <header
            className="
                h-16 flex items-center justify-between px-4 sm:px-6
                bg-white dark:bg-slate-900
                border-b border-slate-200 dark:border-slate-800
            "
            >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button onClick={() => setOpen(true)} className="lg:hidden">
          <Menu />
        </button>

        <h1 className="font-semibold text-lg hidden sm:block">{title}</h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 relative">
        {/* PROFILE */}
        {user && (
          <>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="cursor-pointer"
            >
              <Avatar user={user} />
            </button>

            {/* DROPDOWN */}
            {menuOpen && (
              <div
                className="
                  absolute right-0 top-14 w-48
                  bg-white dark:bg-slate-900
                  border border-slate-200 dark:border-slate-800
                  rounded-xl shadow-lg
                  py-2
                  z-50
                "
              >
                
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
  
                  <div
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(`/profile/${user._id}`);
                    }}
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-md"
                  >
                    <UsersIcon size={16} />
                    <p className="text-sm font-semibold">{user.name}</p>
                  </div>

                </div>

                <button
                  onClick={handleLogout}
                  className="
                    w-full flex items-center gap-2 px-4 py-2 text-sm
                    hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer
                  "
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
    );
};

export default Topbar;