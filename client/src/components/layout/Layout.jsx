import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

const LayOut = ({children})=>{
    const [open , setOpen] = useState(false);
    return(
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
        <Sidebar open={open} setOpen={setOpen} />

        <div className="flex-1 flex flex-col">
            <Topbar setOpen={setOpen} />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
            <Footer />
        </div>
    </div>
    );
};

export default LayOut;