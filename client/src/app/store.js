import { configureStore } from "@reduxjs/toolkit";
import uploadReducer from "../features/uploadSlice";
import userReducer from "../features/userSlice";

export const store = configureStore({
  reducer: {
    upload: uploadReducer,
    user: userReducer,
  }
});
