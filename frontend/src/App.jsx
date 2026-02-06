import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Likes from './pages/Likes';
import Chat from './pages/Chat';
import ChatRoom from './pages/ChatRoom';
import EditProfile from './pages/EditProfile';
import Privacy from './pages/Privacy';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/likes" element={<Likes />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;