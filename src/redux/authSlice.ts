import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  csrfToken: string | null;
}

const initialState: AuthState = {
  csrfToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCsrfToken: (state, action: PayloadAction<string>) => {
      state.csrfToken = action.payload;
    },
  },
});

export const { setCsrfToken } = authSlice.actions;
export default authSlice.reducer;
