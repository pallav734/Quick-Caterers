import { useEffect, useState } from "react";
import LayOut from "../components/layout/Layout";
import {
  Users,
  Building2,
  CalendarDays,
  LayoutGrid,
  FolderTree
} from "lucide-react";
import { getDashboardStats } from "../api/dashboardApi";

const Dashboard = ()=>{
    const [state, setState] = useState(null);
    const [recent, setRecent] = useState([]);

    useEffect(() => {
        fetchState();
    }, []);

    const fetchState = async () => {
        const res = await getDashboardStats();

        setState(res.data.state);
        setRecent(res.data.recentUsers);
    };
    if (!state) {
        return (
            <LayOut>
                <div className="h-[60vh] flex items-center justify-center">
                Loading Dashboard...
                </div>
            </LayOut>
        );
    }
    const cards = [
    {
      title: "Total Users",
      value: state.totalUsers,
      icon: Users,
      color: "bg-indigo-600",
    },

    {
      title: "Total Company",
      value: state.totalCompany,
      icon: Building2,
      color: "bg-cyan-600",
    },

    {
      title: "Total Events",
      value: state.totalEvent,
      icon: CalendarDays,
      color: "bg-emerald-600",
    },
    {
      title: "Total Categories",
      value: state.totalCategories,
      icon: LayoutGrid,
      color: "bg-blue-600",
    },
    {
      title: "Total Subcategories",
      value: state.totalSubCategories,
      icon: FolderTree,
      color: "bg-purple-600",
    },

  ];
    return(
        <LayOut>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>

                <p className="text-sm text-slate-500">Quick Caterers Overview</p>
            </div>
            
            {/* STATS */}

            <div
                className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-5
                gap-4
            "
            >
                {cards.map((item, i) => {
                const Icon = item.icon;

                return (
                    <div
                    key={i}
                    className="
                    bg-white
                    dark:bg-slate-900
                    p-5
                    rounded-xl
                    shadow
                    flex
                    items-center
                    justify-between
                    "
                    >
                    <div>
                        <p className="text-sm text-slate-500">{item.title}</p>

                        <h2 className="text-3xl font-bold mt-1">{item.value}</h2>
                    </div>

                    <div
                        className={`
                        ${item.color}
                        text-white
                        p-3
                        rounded-xl
                        `}
                    >
                        <Icon size={24} />
                    </div>
                    </div>
                );
                })}
            </div>

            {/* RECENT Users */}

            <div className="mt-8">
                <div
                className="
                bg-white
                dark:bg-slate-900
                p-6
                rounded-xl
                shadow
                "
                >
                <h2 className="font-semibold mb-4">Recent Users</h2>

                <ul className="space-y-3">
                    {recent.map((s, i) => (
                    <li
                        key={i}
                        className="
                        flex
                        justify-between
                        text-sm
                    "
                    >
                        <span>{s.name}</span>

                        <span className="text-slate-500">{s.email}</span>
                    </li>
                    ))}
                </ul>
                </div>
            </div>
        </LayOut>
    );
}

export default Dashboard;