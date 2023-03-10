import './App.css';
import { Routes, Route } from 'react-router-dom';
import LoginSelector from './Pages/Login/LoginSelector';
import Home from './Pages/Home/Home';
import Profile from './Pages/Profile/Profile';
import Error404 from './Pages/Errors/Error404';
import Navbar from './Pages/Navbar/Navbar';
import GoogleLogin from './Pages/Login/Google/GoogleLogin';
import FortyTwoLogin from './Pages/Login/42/FortyTwoLogin';
import TranscendenceLogin from './Pages/Login/Transcendence/TranscendenceLogin';

function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginSelector />} />
        <Route path="/login/auth42" element={<FortyTwoLogin />} />
        <Route path="/login/google" element={<GoogleLogin/>} />
        <Route path="/login/transcendence" element={<TranscendenceLogin />} />
        <Route path="/home" element={<Home />} />
        <Route path='/profil/:id' element={<Profile/>} />
        <Route path='/*' element={<Error404 />} />
      </Routes>
    </div>
  );
}

export default App
