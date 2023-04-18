import { Routes, Route } from "react-router-dom";
import LoginSelector from "./Pages/Login/LoginSelector";
import CreateAccount from "./Pages/Login/CreateAccount/CreateAccount";
import FollowingAccountCreation from "./Pages/Login/CreateAccount/FollowingAccountCreation";
import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";
import NotFound from "./Pages/Errors/NotFound/NotFound";
import Layout from "./Pages/Navbar/Layout";
import Unauthorized from "./Pages/Errors/Unauthorized/Unauthorized";
import InitAchievements from "./Pages/Achievements/Achievements";
import InitStats from "./Pages/Stats/Stats";
import Settings from "./Pages/Settings/Settings";
import TwoFactor from "./Pages/Login/TwoFactor/TwoFactor";
import { UserContext } from "./context/UserContext";
import { useContext } from "react";
import Loading from "./Pages/Loading/Loading";

function App() {
	const { user } = useContext(UserContext);

	return (
		<div className="App">
			<Routes>
				<Route path="/home" element={<Layout children={<Home />} />} />
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
				<Route path="/login/2fa" element={<TwoFactor />} />
				<Route path="/*" element={<Layout children={<NotFound />} />} />
				<Route path="/loading" element={<Loading />} />
			</Routes>
		</div>
	)
}

export default App;
