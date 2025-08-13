const getQuestionSubmissions=async(questionId)=>{
    try{
        const token=localStorage.getItem('token');
        const response=await fetch(`${import.meta.env.VITE_SERVER_URL}/api/code/submissions/${questionId}`,{
            headers:{
                'Authorization': `Bearer ${token}`,
            }
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

export {getQuestionSubmissions};