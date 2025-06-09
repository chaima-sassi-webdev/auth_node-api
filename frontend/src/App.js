// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';
import Register from './signup';
import ForgotPassword from "./forgetPassword";
import UsersList from './users';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
	<Route path="/forget-password" element={<ForgotPassword />} />
	<Route path="/users" element={<UsersList />} />
      </Routes>
    </Router>
  );
}

export default App;

