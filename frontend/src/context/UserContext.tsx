import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import Cookies from "js-cookie";

type UserData = {
	name: string;
	id: number;
	profilePicture: string;
	elo: number;
};

export const UserContext = React.createContext({} as any);

const UserContextProvider = ({ children }: any) => {
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<UserData>();

	const notificationSocketRef = useRef({});
	notificationSocketRef.current = io("http://localhost:3001/notifications", {
		auth: {
			token: Cookies.get("connect.sid"),
		},
	});

	const gameSocketRef = useRef({});

	gameSocketRef.current = io("http://localhost:3001/game", {
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
			if (response.status === 401) setUser(undefined);
			else setUser(data);
			setIsLoading(false);
		};
		fetchUserData();
	}, []);

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
				notificationSocketRef,
				gameSocketRef,
				isLoading,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export default UserContextProvider;
