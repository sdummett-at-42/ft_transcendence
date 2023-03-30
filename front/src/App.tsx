import { Routes, Route } from "react-router-dom";
import Login from "./Pages/Login/Login";
import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";
import NotFound from "./Pages/Errors/NotFound";
import Layout from "./Pages/Navbar/Layout";
import Unauthorized from "./Pages/Errors/Unauthorized/Unauthorized";
// import TranscendenceLogin from "./Pages/Login/Transcendence/TranscendenceLogin";

function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/login/transcendence" element={<TranscendenceLogin />} /> */}

        <Route path="/home" element={<Layout children={<Home />} />} />
        {/* <Route path="/chat" element={<Layout children={<Chat />} />} /> */}
        <Route path='/profil/:id' element={<Layout children={<Profile />} />} />
        <Route path='/unauthorized' element={<Unauthorized />} />
        <Route path='/*' element={<Layout children={<NotFound />} />} />
      </Routes>
    </div>
  );
}

export default App
