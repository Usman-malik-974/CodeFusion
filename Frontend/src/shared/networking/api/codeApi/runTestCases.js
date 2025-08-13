const runTestCases=async(code,language,questionId)=>{
    try{
        const token=localStorage.getItem('token');
        const response=await fetch(`${import.meta.env.VITE_SERVER_URL}/api/code/runtestcases`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                'Authorization': `Bearer ${token}`,
            },
            body:JSON.stringify({language,code,questionId})
        });
        if(response.status>=401 && response.status<=404){
            return {status:response.status}
        }
        const data=await response.json();
        return data;
    }
    catch(e){
        console.log(e);
         return {
            error:"Something Went Wrong"
         }
    }
}

export {runTestCases};