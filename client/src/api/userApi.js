import API from "./axios";

export const createUser = (data)=>{
    return API.post("/user/create-user" , data);
}
export const getUsers = (params) => {
   return API.get("/user/get-all-users", {
      params, // axios automatically converts to query string
   });
};

export const updateUser = (id , data) =>{
    return API.put(`/user/update-user/${id}`,data);
}

export const deleteUser = (id , data) =>{
    return API.delete(`/user/delete-user/${id}`,data);
}

export const getSingleUser = (id) =>{
    return API.get(`/user/get-single-user/${id}`);
}

export const toggleUserStatusApi = (id) => {
  return API.put(`/user/toggle-status/${id}`);
};

export const uploadProfileImage = (file) =>{
    const formData = new FormData();
    formData.append("profileImage", file);
    return API.put("/user/upload-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}    