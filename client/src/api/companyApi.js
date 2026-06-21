import API from "./axios";

export const createCompany = (data)=>{
    return API.post("/company/create-company" , data);
}

export const getCompany = (params)=>{
    return API.get("company/get-all-company/",{
        params,
    });
};
export const getSingleCompany = (id)=>{
    return API.get(`company/get-single-company/${id}`);
}

export const updateCompany = (id,data)=>{
    return API.put(`company/update-company/${id}`,data);
}

export const deleteCompany = (id , data) =>{
    return API.delete(`company/delete-company/${id}` , data);
}

export const updateCompanyStatus = (id, data) => {
  return API.put(`company/update-company-status/${id}/status`,  data );
};

export const getSubCategoryByCategory = (categoryId)=>{
    return API.get(`company/by-category/${categoryId}`);
}