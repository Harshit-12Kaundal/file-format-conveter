import { createSlice } from '@reduxjs/toolkit';

const uploadSlice = createSlice({
  name: 'upload',

  initialState: {
    file: null,
    fileName: '',
  },

  reducers: {
    setUploadedFile(state, action) {
      state.file = action.payload;
      state.fileName = action.payload.name;
    },
    clearUploadedFile(state) {
      state.file = null;
      state.fileName = '';
    }
  }
});

export const { setUploadedFile, clearUploadedFile } = uploadSlice.actions;
export default uploadSlice.reducer;
