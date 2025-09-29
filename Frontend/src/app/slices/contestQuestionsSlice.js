import { createSlice } from "@reduxjs/toolkit";

const contestQuestionsSlice = createSlice({
    name: "contestQuestions",
    initialState: {
        contestQuestions: {}, // object, not array
    },
    reducers: {
        setContestQuestions: (state, action) => {
            const contestId = Object.keys(action.payload)[0];
            state.contestQuestions[contestId] = action.payload[contestId];
        },
        markQuestionSolved: (state, action) => {
            const { contestId, questionId } = action.payload;
            console.log(contestId,questionId);
            const questions = state.contestQuestions[contestId];
            if (!questions) return;

            const q = questions.find((q) => q.id === questionId);
            if (q) {
                q.done = true;
            }
        }

    },
});

export const { setContestQuestions,markQuestionSolved } = contestQuestionsSlice.actions;
export default contestQuestionsSlice.reducer;
