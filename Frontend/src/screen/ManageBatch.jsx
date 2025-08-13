import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ManageBatch = () => {
    const [batch,setBatch]=useState({});
    const location=useLocation();
    useEffect(()=>{
        const data=location.state?.batchData;
        setBatch(data);
        console.log(data);
    },[location.state])
    return (
       <h3>{batch.batchName}</h3>
       
    )
}

export default ManageBatch;