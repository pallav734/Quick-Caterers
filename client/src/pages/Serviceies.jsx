import { useEffect } from "react";
import { useAuth } from "../components/context/AuthContext";
import LayOut from "../components/layout/Layout";
import { Users as UsersIcon, Pencil, Trash2 , Wrench } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import DeleteConfirmModal from "../users/DeleteConfirmModal";
import { deleteService, getServices } from "../api/serviceApi";
import AddServiceModal from "../services/AddServiceModal";
import EditServiceModal from "../services/EditServiceModal";


/* STATUS COLORS */
const statusColor = {
  true: "bg-emerald-100 text-emerald-700",
  false: "bg-red-100 text-red-700",
};

const Serviceies = ()=>{
    const {user} = useAuth();
    const [open, setOpen] = useState(false);
    const [editService, setEditService] = useState(null);
    const [serviceData, setServiceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleteServiceId, setDeleteServiceId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [page,setPage] = useState(1);
    const [totalPages,setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    //Fetch Users
    useEffect(()=>{
        const fetchService= async()=>{
            try {
                setLoading(true);
                const res = await getServices({page , limit:10, search});
                setServiceData(res.data?.services || []);
                setTotalPages(res.data?.totalPages || 1);
            } catch (err) {
                setError("Failed to fetch Services");
            } finally {
                setLoading(false);
            }
        };
        const delay = setTimeout(() => {
            fetchService();
        }, 500);
        return () => clearTimeout(delay);
    }, [page , search]);
        const handleDelete = async () => {
            try {
                setDeleteLoading(true);
                await deleteService(deleteServiceId);
                toast.success("Service deleted successfully ");
                await refetchServices();
                setDeleteServiceId(null);
            } catch (error) {
                toast.error(error.response?.data?.message || "Delete failed");
            } finally {
                setDeleteLoading(false);
            }
        };
    /* Manual refetch*/
        const refetchServices = async () => {
            const res = await getServices({
            page,
            limit: 5,
            search,
        });
        setServiceData(res.data?.services || []);
        setTotalPages(res.data?.totalPages || 1);
    };
    const service = serviceData;
    return(
        <LayOut>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Wrench size={24} />
                    Event Management
                </h1>
                </div>
                <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
                    <input
                        type="text"
                        placeholder="Search by name"
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
                        + Add Event
                    </button>
                </div>
            </div>
            {/* LOADING */}
            {loading && <p className="text-center py-10">Loading Service...</p>}

             {/* EMPTY STATE */}
            {!loading && service.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <p className="text-slate-500 font-medium">
                    No Service found
                </p>
                </div>
            )}
            {/* TABLE */}
            {!loading && service.length > 0 && (
                <div className="hidden md:block w-full overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                    <tr className="text-left text-slate-600">
                        <th className="p-4">Name</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Status</th>
                        
                    </tr>
                    </thead>

                    <tbody>
                    {service.map((s) => (
                        <tr key={s._id} className="border-b hover:bg-slate-50">
                        <td className="p-4 font-medium">{s.name}</td>
                        <td className="p-4 font-medium">{s.description}</td>
                        <td>
                            <div className="flex items-center gap-2">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[s.isActive]}`}
                            >
                                {s.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>

                            <button
                                onClick={() => setEditService(s)}
                                className="p-1 rounded hover:bg-slate-100"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => setDeleteServiceId(s._id)}
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

            {/* Modals */}
            <AddServiceModal
                open={open}
                setOpen={setOpen}
                refetch={refetchServices}
           />
           <EditServiceModal 
                service={editService}
                onClose={() => setEditService(null)}
                refetch={refetchServices}
           />
           <DeleteConfirmModal
                open={!!deleteServiceId}
                setOpen={() => setDeleteServiceId(null)}
                onConfirm={handleDelete}
                loading={deleteLoading}
                itemName="service"
            />
        </LayOut>
    );
};
export default Serviceies;