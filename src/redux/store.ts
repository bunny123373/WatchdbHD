import { configureStore } from "@reduxjs/toolkit";
import contentReducer from "./slices/contentSlice";
import uiReducer from "./slices/uiSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      content: contentReducer,
      ui: uiReducer,
    },
  });
};

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
