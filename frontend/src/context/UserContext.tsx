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
	const [rendered, setRendered] = useState(false);
	const [user, setUser] = useState<UserData>();
	const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

	const notificationSocketRef = useRef({});
	const gameSocketRef = useRef({});
	if (!rendered) {
		notificationSocketRef.current = io(
			"http://localhost:3001/notifications",
			{
				auth: {
					token: Cookies.get("connect.sid"),
				},
			}
		);

		gameSocketRef.current = io("http://localhost:3001/game", {
			auth: {
				token: Cookies.get("connect.sid"),
			},
		});
		setRendered(true);
	}

	useEffect(() => {
		const fetchUserData = async () => {
			const response = await fetch("http://localhost:3001/users/me", {
				credentials: "include",
				method: "GET",
			});
			const data = await response.json();
			if (response.status === 401) {
				setUser(undefined);
			} else {
				// Append timestamp as query parameter to profile picture URL
				data.profilePicture = `${data.profilePicture}?ts=${Date.now()}`;
				setUser(data);
			}
			setIsLoading(false);
		};
		fetchUserData();
	}, [lastUpdate]);

	return (
		<UserContext.Provider
			value={{
				user,
				notificationSocketRef,
				gameSocketRef,
				isLoading,
				setLastUpdate,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export default UserContextProvider;
