import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Cookies from "js-cookie";

export const UserContext = React.createContext({} as any);

const UserContextProvider = ({ children }: any) => {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const friendSocketRef = useRef(null);
	const achievementSocketRef = useRef(null);

	friendSocketRef.current = io("http://localhost:3001/friends", {
		auth: {
			token: Cookies.get("connect.sid"),
		},
	});

	achievementSocketRef.current = io("http://localhost:3001/achievements", {
		auth: {
			token: Cookies.get("connect.sid"),
		},
	});

	useEffect(() => {
		const fetchUserData = async () => {
			const response = await fetch("http://localhost:3001/users/me", {
				credentials: "include",
				method: "GET",
			});
			const data = await response.json();
			if (response.status === 401) setUser(null);
			else setUser(data);
			setIsLoading(false);
		};
		fetchUserData();
	}, []);

	return (
		<UserContext.Provider
			value={{ user, setUser, friendSocketRef, achievementSocketRef, isLoading }}
		>
			{isLoading ? <div>Loading...</div> : children}
		</UserContext.Provider>
	);
};

export default UserContextProvider;
