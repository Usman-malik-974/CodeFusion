const runCode=async(code,language,input)=>{
    try{
        const response=await fetch(`${import.meta.env.VITE_SERVER_URL}/api/run`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify({language,code,input})
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

export {runCode};