import API from "./axios"

export const createCategory = (data)=>{
    return API.post("/category/create-category",data);
}

export const getCategory = (params)=>{
    return API.get("category/get-all-category/",{
        params,
    });
};
export const getSingleCategory = (id)=>{
    return API.get(`category/get-single-category/${id}`);
}

export const updateCategory = (id,data)=>{
    return API.put(`category/update-category/${id}`,data);
}

export const deleteCategory = (id , data) =>{
    return API.delete(`category/delete-category/${id}` , data);
}

