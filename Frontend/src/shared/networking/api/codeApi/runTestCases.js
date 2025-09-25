const runTestCases=async(code,language,questionId,contestId)=>{
    try{
        const token=localStorage.getItem('token');
        let obj={language,code,questionId};
        if(contestId) obj.contestId=contestId;
        const response=await fetch(`${import.meta.env.VITE_SERVER_URL}/api/code/runtestcases`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                'Authorization': `Bearer ${token}`,
            },
            body:JSON.stringify(obj)
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