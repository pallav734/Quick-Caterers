import API from "./axios"

export const createSubCategory = (data)=>{
    return API.post("/sub-category/create-sub-category",data);
}

export const getSubCategory = (params)=>{
    return API.get("sub-category/get-all-sub-category/",{
        params,
    });
};
export const getSingleSubCategory = (id)=>{
    return API.get(`sub-category/get-single-sub-category/${id}`);
}

export const updateSubCategory = (id,data)=>{
    return API.put(`sub-category/update-sub-category/${id}`,data);
}

export const deleteSubCategory = (id , data) =>{
    return API.delete(`sub-category/delete-sub-category/${id}` , data);
}

