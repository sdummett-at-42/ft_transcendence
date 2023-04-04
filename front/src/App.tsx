import { Routes, Route } from "react-router-dom";
import LoginSelector from "./Pages/Login/LoginSelector";
import ForgotMail from "./Pages/Login/forgotMail/ForgotMail";
import LoginFortyTwo from "./Pages/Login/FortyTwoLogin/LoginFortyTwo"
import CreateAccount from "./Pages/Login/CreateAccount/CreateAccount"
import FollowingAccountCreation from "./Pages/Login/CreateAccount/FollowingAccountCreation";
import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";
import NotFound from "./Pages/Errors/NotFound";
import Layout from "./Pages/Navbar/Layout";
import Unauthorized from "./Pages/Errors/Unauthorized/Unauthorized";

function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginSelector />} />
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/register/finalization" element={<FollowingAccountCreation />} />
        <Route path="/forgotMail" element={<ForgotMail />} />
        <Route path="/login/intra42" element={<LoginFortyTwo />} />

        <Route path="/home" element={<Layout children={<Home />} />} />
        {/* <Route path="/chat" element={<Layout children={<Chat />} />} /> */}
        <Route path='/profil/:id' element={<Layout children={<Profile />} />} />
        <Route path='/unauthorized' element={<Unauthorized />} />
        {/* <Route path='/*' element={<Layout children={<NotFound />} />} /> */}
      </Routes>
    </div>
  );
}

export default App
