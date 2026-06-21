import { useEffect } from "react";
import { useState } from "react";
import { updateUser } from "../api/userApi";
import { X } from "lucide-react";

const EditUserModal = ({ user, onClose, refetch })=>{
     /* SAFE STATE */
    const [form ,setForm] = useState({
        name: "",
        email: "",
        mobile: "",
        role: "",
        address: "",
        isActive: true,
    })

     /* LOAD USER INTO FORM */
     useEffect(()=>{
        if(user){
            setForm({
                name : user.name || "",
                email: user.email || "",
                mobile: user.mobile || "",
                role: user.role || "",
                address: user.address|| "",
                isActive: user.isActive ?? true,
            })
        }
     },[user]);

    if (!user) return null;

    const handleSubmit= async(e)=>{
        e.preventDefault();
        await updateUser(user._id,form);
        refetch();
        onClose();
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
        <h2 className="text-xl font-bold mb-4">Edit User</h2>

        <form onSubmit={handleSubmit}  className="space-y-3">
            {/* INPUTS */}
            {["name" , "email" , "mobile" , "address"].map((field)=>(
                <input 
                    key={field}
                    value={form[field]}
                    onChange={(e)=> setForm({...form , [field]:e.target.value})} 
                    className="input w-full"
                    placeholder={field}
                    required
                />
            ))}
            {/* ROLE */}
            <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="input w-full"
                required
            >
            <option value="">Select Role</option>
            <option>SUB_ADMIN</option>
            {/* <option>COUNSELLOR</option>
            <option>TRAINER</option>
            <option>FINANCE</option>
            <option>PLACEMENT</option> */}
          </select>

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
          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg">
            Update User
          </button>
        </form>
        </div>        
        </div>
    );
};
export default EditUserModal;