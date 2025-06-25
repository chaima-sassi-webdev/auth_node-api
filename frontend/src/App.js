import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from "./login";
import Register from "./signup";
import ForgotPassword from "./forgetPassword"; 
import UsersList from "./users";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forget-password" element={<ForgotPassword /> } />
      <Route path="/users" element={<UsersList /> } />
    </Routes>
  );
}

export default App;
