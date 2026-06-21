import API from "./axios";

export const getDashboardStats = async (data) => {
    return API.get("/dashboard/state", data);
};

