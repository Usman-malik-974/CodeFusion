import { createSlice } from "@reduxjs/toolkit";
import ContestQuestions from "../../screen/ContestQuestions";

const contestQuestionsSlice=createSlice({
    name:"contestQuestions",
    initialState:{
        contestQuestions:[]
    },
    reducers:{
        setContestQuestions:(state,action)=>{
            // console.log(action.payload);
            state.contestQuestions.push(action.payload);
        }
    }
})

export const {setContestQuestions}=contestQuestionsSlice.actions;
export default contestQuestionsSlice.reducer;
