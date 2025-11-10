import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
	name: "network",
	initialState: { online: true, pageLoaded: false },
	reducers: {
		setOnline: (state, action) => {
			state.online = !!action.payload;
		},
		setPageLoaded: (state, action) => {
			state.pageLoaded = !!action.payload;
		},
	},
});

export const { setOnline, setPageLoaded } = slice.actions;
export default slice.reducer;
