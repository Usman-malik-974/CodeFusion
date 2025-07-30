import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
    name: "users",
    initialState: {
       usersList: [],
    },
    reducers: {
        setUsersList: (state, action) => {
            state.usersList = action.payload; 
        },
    },
});

export const { setUsersList } = usersSlice.actions;
export default usersSlice.reducer;
