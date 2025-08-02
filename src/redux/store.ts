import { configureStore, type ThunkAction, type Action, combineReducers } from '@reduxjs/toolkit'
import authReducerr from './user/userSlice';
import themeReducer from "./theme/themeSlice";
import chatReducer from "./chat/chatStorer";
// import { Root } from 'react-dom/client';

const rootReducer = combineReducers({
    auth: authReducerr,
    theme: themeReducer,
    chat: chatReducer,
})


export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  })
}

export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
export type RootState = ReturnType<typeof rootReducer>

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>