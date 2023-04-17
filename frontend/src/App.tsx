import { Routes, Route } from "react-router-dom";
import LoginSelector from "./Pages/Login/LoginSelector";
// import ForgotMail from "./Pages/Login/forgotMail/ForgotMail";
import LoginFortyTwo from "./Pages/Login/FortyTwoLogin/LoginFortyTwo";
import CreateAccount from "./Pages/Login/CreateAccount/CreateAccount";
import FollowingAccountCreation from "./Pages/Login/CreateAccount/FollowingAccountCreation";
import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";
import NotFound from "./Pages/Errors/NotFound";
import Layout from "./Pages/Navbar/Layout";
import Unauthorized from "./Pages/Errors/Unauthorized/Unauthorized";
import InitAchievements from "./Pages/Achievements/Achievements";
import InitStats from "./Pages/Stats/Stats";
import Settings from "./Pages/Settings/Settings";
import { useEffect, useState } from "react";
import TwoFactor from "./Pages/Login/TwoFactor/TwoFactor";

function App() {
	const [user, setUser] = useState(null);

	useEffect(() => {
		async function fetchUser() {
			const response = await fetch("http://localhost:3001/users/me", {
				method: "GET",
				credentials: "include",
			});
			const userData = await response.json();
			setUser(userData);
		}
		fetchUser();
	}, []);

	return (
		<div className="App">
			<Routes>
				<Route path="/home" element={<Layout children={<Home />} />} />
				{/* <Route path="/chat" element={<Layout children={<Chat />} />} /> */}
				{user ? (
				<Route
					path="/profile"
					element={<Layout children={<Profile userId={user.id} />} />}
				/>
				) : null}
				<Route
					path="/settings"
					element={<Layout children={<Settings />} />}
				/>
				<Route path="/unauthorized" element={<Unauthorized />} />
				<Route
					path="/achievements"
					element={<Layout children={<InitAchievements />} />}
				/>
				<Route
					path="/stats"
					element={<Layout children={<InitStats />} />}
				/>
				<Route path="/" element={<LoginSelector />} />
				<Route path="/register" element={<CreateAccount />} />
				<Route
					path="/register/finalization"
					element={<FollowingAccountCreation />}
				/>
				{/* <Route path="/forgotMail" element={<ForgotMail />} /> */}
				<Route path="/login/intra42" element={<LoginFortyTwo />} />
				<Route path="/login/2fa" element={<TwoFactor />} />
				<Route path="/*" element={<Layout children={<NotFound />} />} />
			</Routes>
		</div>
	)
}

export default App;
