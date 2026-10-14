import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "",
  email: "",
  photoURL: "",
  loggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    loginUser(state, action) {
      const { username, email, photoURL } = action.payload;
      state.username = username || "";
      state.email = email || "";
      state.photoURL = photoURL || "";
      state.loggedIn = true;
    },
    logoutUser(state) {
      state.username = "";
      state.email = "";
      state.photoURL = "";
      state.loggedIn = false;
    }
  }
});

export const { loginUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
