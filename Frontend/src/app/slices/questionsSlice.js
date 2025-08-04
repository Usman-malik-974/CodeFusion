import { createSlice } from "@reduxjs/toolkit";

const questionsSlice = createSlice({
    name: "questions",
    initialState: {
        questionsList: [],
    },
    reducers: {
        setQuestionsList: (state, action) => {
            console.log("in",action.payload);
            state.questionsList = action.payload;
        },
    }
})

export const { setQuestionsList } = questionsSlice.actions;
export default questionsSlice.reducer;