import React, { useState, useEffect } from "react";

export default function SpecProfile({ user }) {
    const [allUsers, setAllUsers] = useState([]);
    const [allMatches, setAllMatches] = useState(null);

    // fetch all users
    useEffect(() => {
        async function GetAllUsers() {
            const response = await fetch("http://localhost:3001/users", {
                method: "GET",
                credentials: "include",
            });
            const data = await response.json();
            setAllUsers(data);
        }
    },[]);

    // fetch all match played by user
    useEffect(() => {

        async function GetAllMatches() {
            const response = await fetch(`http://localhost:3001/users/${user.id}/matchs`, {
				method: "GET",
				credentials: "include",
			});
			const data = await response.json();
			setAllMatches(data);
        }

        GetAllMatches();
    }, [user]);

    
    
    return;
}