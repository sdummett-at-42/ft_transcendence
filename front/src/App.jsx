import './App.css';
import { Routes, Route } from 'react-router-dom';
import LoginSelector from './Pages/Login/LoginSelector';
import Home from './Pages/Home/Home';
import Profile from './Pages/Profile/Profile';
import NotFound from './Pages/Errors/NotFound';
import Layout from './Pages/Navbar/Layout';
import GoogleLogin from './Pages/Login/Google/GoogleLogin';
import FortyTwoLogin from './Pages/Login/42/FortyTwoLogin';
import TranscendenceLogin from './Pages/Login/Transcendence/TranscendenceLogin';
import ChatLogin from './Pages/Chat/ChatLogin';

function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginSelector />} />
        <Route path="/login/auth42" element={<FortyTwoLogin />} />
        <Route path="/login/google" element={<GoogleLogin />} />
        <Route path="/login/transcendence" element={<TranscendenceLogin />} />
        <Route path="/chat" element={<ChatLogin/>} />

        <Route path="/home" element={<Layout children={<Home />} />} />
        <Route path='/profil/:id' element={<Layout children={<Profile />} />} />
        <Route path='/*' element={<Layout children={<NotFound />} />} />
      </Routes>
    </div>
  );
}

export default App
