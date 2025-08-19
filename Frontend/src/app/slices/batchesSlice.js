import { createSlice } from "@reduxjs/toolkit";

const batchesSlice = createSlice({
    name: "batches",
    initialState: {
       batchesList: [],
    },
    reducers: {
        setBatchesList: (state, action) => {
            // console.log("in",action.payload);
            state.batchesList = action.payload;
        },
    }
})

export const { setBatchesList } = batchesSlice.actions;
export default batchesSlice.reducer;