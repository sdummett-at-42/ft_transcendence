import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import Cookies from "js-cookie";

type UserData = {
    name: string;
    id: number;
    profilePicture: string;
    elo: number;
}

export const UserContext = React.createContext({} as any);

const UserContextProvider = ({ children }: any) => {
    const [user, setUser] = useState<UserData>();

    const friendSocketRef = useRef({});
    friendSocketRef.current = io('http://localhost:3001/friends', {
        auth: {
            token: Cookies.get('connect.sid'),
        },
    });


    const gameSocketRef = useRef({});

    gameSocketRef.current = io('http://localhost:3001/game', {
        auth: {
            token: Cookies.get('connect.sid'),
        },
    });

    return (
        <UserContext.Provider value={{ user, setUser, friendSocketRef, gameSocketRef }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserContextProvider;