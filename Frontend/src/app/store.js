import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./slices/usersSlice";
import questionsReducer from './slices/questionsSlice'

export const store = configureStore({
    reducer: {
        users: usersReducer,
        questions:questionsReducer,
    },
});
