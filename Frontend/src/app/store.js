import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./slices/usersSlice";
import questionsReducer from './slices/questionsSlice'
import batchesReducer from './slices/batchesSlice'

export const store = configureStore({
    reducer: {
        users: usersReducer,
        questions:questionsReducer,
        batches:batchesReducer,
    },
});
