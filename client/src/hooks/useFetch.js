import { useEffect } from "react";
import { useState } from "react"

const useFetch = (apiCall)=>{
    const[data,setData] = useState(null);
    const[loading,setLoading] =useState(true);
    const [error,setError] = useState(null);
    
    const fetchData = async()=>{
        try {
            setLoading(true);
            setError(false);
            const res = await apiCall();
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally{
            setLoading(false);
        }
    };

    useEffect(()=>{
        fetchData();
    }, []);
    
    return {data , loading , error , refetch:fetchData};
}

export default useFetch;