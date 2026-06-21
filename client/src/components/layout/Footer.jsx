import { useEffect } from "react";
import { useState } from "react";

const Footer = () =>{
    const[dateTime , setDateTime] = useState("");
    useEffect(()=>{
        const updateTime = () => {
        const now = new Date();

        const formatted = now.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        }) + " " +
        now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });

        setDateTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime , 1000);
    return () => clearInterval(interval);
    }, [])
    return(
         <footer
            className="
                transition-all duration-300
                border-t border-slate-200 dark:border-slate-800
                dark:bg-slate-900
                px-4 sm:px-6 py-3
                text-xs sm:text-sm"
            >
            <div
                className="
                max-w-7xl mx-auto
                flex flex-col
                items-center
                justify-center
                text-center
                gap-2
                text-center md:text-center
                "
            >
                <p className="text-slate-600 dark:text-slate-400">
                    {dateTime} © Quick Caterers. All rights reserved.
                </p>
            </div>    
        </footer>
    );
};
export default Footer;