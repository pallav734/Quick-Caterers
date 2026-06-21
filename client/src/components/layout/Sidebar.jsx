import { useAuth } from "../context/AuthContext"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarCheck,
  Layers,
  IndianRupee,
  Building2,
  BarChart3,
  GraduationCap,
  Wrench,
  LayoutGrid,
  FolderTree
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = ({open , setOpen}) =>{
    const {user} = useAuth();

    
  // 🔐 ROLE-BASED MENU CONFIG

  const menuByRole = {
     SUPER_ADMIN: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Users", path: "/users", icon: Users },
      { name: "Companies", path: "/companies", icon: Building2 },
      { name: "Events", path: "/services", icon: Wrench },
      { name: "Category", path: "/category", icon: LayoutGrid },
      { name: "Reports", path: "/reports", icon: BarChart3 },
    ],
     SUB_ADMIN: [   
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Companies", path: "/companies", icon: Building2 },
      { name: "Category", path: "/category", icon: LayoutGrid },
      // { name: "Sub-Category", path: "/sub-category", icon: FolderTree },
      { name: "Events", path: "/services", icon: Wrench },
    ],
  };
   const menu = menuByRole[user?.role] || [];
   return(
    <>
    {/* MOBILE OVERLAY */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden ${
          open ? "block" : "hidden"
        }`}
      />

      {/* SIDEBAR */}
      <aside
        className={`
          fixed z-50 lg:static
          h-screen w-64
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* LOGO */}
        <div className="p-6 text-xl font-bold text-indigo-600">Quick Caterers</div>

        {/* MENU */}
        <nav className="px-4 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                transition
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-slate-800"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }
              `
              }
              onClick={() => setOpen(false)}
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
   )
};

export default Sidebar;