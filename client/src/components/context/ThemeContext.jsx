import { useState } from "react";
import { useEffect } from "react";
import { createContext } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) =>{
    // always light
    const [theme] = useState("light");

    useEffect(()=>{
        const root = document.documentElement;
        // remove any previous classes
        root.classList.remove("light" , "dark");

        // force light theme
        root.classList.add("light");

        // optional: keep in localStorage
        localStorage.setItem("Theme" , "light");
    } , []);
    return(
        <ThemeContext.Provider value={{theme}}>{children}</ThemeContext.Provider>
    );
};