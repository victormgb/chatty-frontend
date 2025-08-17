import Navbar from "./components/Navbar";
import "./global.css"

// import HomePage from "./pages/HomePage";
// import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
// import SettingsPage from "./pages/SettingsPage";
// import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from './redux/hooks';
import {
  checkAuth, // Import the async thunk
  selectAuthUser,
  selectIsCheckingAuth,
} from './redux/user/userSlice'; // Adjust path as necessary

import {
  selectTheme
} from "./redux/theme/themeSlice";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import SignUpPage from "./pages/SignUpPage";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import AddUser from "./components/AddUser";




const App = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const isCheckingAuth = useAppSelector(selectIsCheckingAuth);
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    dispatch(checkAuth());
  }, []);

  // console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    // <div data-theme={theme}>
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        {/* <Route path="/settings" element={<SettingsPage />} /> */}
        {/* <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} /> */}
      </Routes>

      <AddUser/>

      <Toaster />
    </div>
  );
};
export default App;
