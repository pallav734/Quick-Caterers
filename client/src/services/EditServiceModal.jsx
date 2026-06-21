import { useEffect } from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { updateService } from "../api/serviceApi";
import toast from "react-hot-toast";

const EditServiceModal = ({ service, onClose, refetch })=>{
     /* SAFE STATE */
    const[loading , setLoading] = useState(false);
    const [form ,setForm] = useState({
        name: "",
        description: "",
        isActive: true,
    })

     /* LOAD USER INTO FORM */
     useEffect(()=>{
        if(service){
            setForm({
                name : service.name || "",
                description: service.description || "",
                isActive: service.isActive ?? true,
            })
        }
     },[service]);

    if (!service) return null;

    const handleSubmit= async(e)=>{
        e.preventDefault();
        try {
            setLoading(true);
            await updateService(service._id,form);
            toast.success("Event update Successfully !")
            refetch();
            onClose(); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Error Updating event"); 
        }finally {
            setLoading(false);
        }
        
    }
    return(
        <div onClick={onClose}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        {/* MODAL */}
        <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-xl"
        >
            {/* CLOSE */}
        <button onClick={onClose} className="absolute right-4 top-4">
          <X />
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Event</h2>

        <form onSubmit={handleSubmit}  className="space-y-3">
            {/* INPUTS */}
            {["name" , "description"].map((field)=>(
                <input 
                    key={field}
                    value={form[field]}
                    onChange={(e)=> setForm({...form , [field]:e.target.value})} 
                    className="input w-full"
                    placeholder={field}
                    required
                />
            ))}
            
          {/* STATUS */}
          <select
            value={form.isActive}
            onChange={(e) =>
              setForm({ ...form, isActive: e.target.value === "true" })
            }
            className="input w-full"
          >
            <option value={true}>ACTIVE</option>
            <option value={false}>INACTIVE</option>
          </select>
          {/* BUTTON */}
          <button disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg">
            {loading ? "Updating..." : "Update event"}
          </button>
        </form>
        </div>        
        </div>
    );
};
export default EditServiceModal;