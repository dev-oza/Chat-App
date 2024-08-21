import { configureStore } from "@reduxjs/toolkit";
import api from "./api/api";
import authSlice from "./reducer/auth";
import miscSlice from "./reducer/misc";
import chatSlice from "./reducer/chat";

const store = configureStore({
    reducer: {
        [authSlice.name]: authSlice.reducer,
        [miscSlice.name]: miscSlice.reducer,
        [chatSlice.name]: chatSlice.reducer,
        [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),  // Ensure proper concatenation
});

export default store;