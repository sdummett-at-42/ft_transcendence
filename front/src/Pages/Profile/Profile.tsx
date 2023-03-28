import React from "react";
import { useParams } from "react-router-dom";
import FriendsList from "../Home/FriendsList/FriendsList";

export default function Profile() {

    const params = useParams();
    console.log(params);

    return (
        <div>
            <FriendsList />
        </div>
    );
}