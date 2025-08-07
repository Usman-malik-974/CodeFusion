const runTestCases=async(code,language,questionId)=>{
    try{
        const response=await fetch(`${import.meta.env.VITE_SERVER_URL}/api/code/runtestcases`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify({language,code,questionId})
        });
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