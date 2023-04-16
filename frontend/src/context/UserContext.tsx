import React, { useState, useRef } from "react";
import io from "socket.io-client";
import Cookies from "js-cookie";

export const UserContext = React.createContext({} as any);

const UserContextProvider = ({ children }: any) => {
    const [user, setUser] = useState(null);

    const friendSocketRef = useRef(null);

    friendSocketRef.current = io('http://localhost:3001/friends', {
        auth: {
            token: Cookies.get('connect.sid'),
        },
    });

    const gameSocketRef = useRef(null);

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