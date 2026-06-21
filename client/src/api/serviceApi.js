import API from "./axios";

export const createService = (data)=>{
    return API.post("/service/create-service", data);
}

export const getServices = (params) => {
   return API.get("/service/get-all-service", {
      params, // axios automatically converts to query string
   });
};

export const updateService = (id , data) =>{
    return API.put(`/service/update-service/${id}`,data);
}

export const deleteService = (id , data) =>{
    return API.delete(`/service/delete-service/${id}`,data);
}