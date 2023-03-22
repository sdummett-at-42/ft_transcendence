import React, { useState, useEffect } from "react";
import axios from "axios";


function DataFetching() {

    const [posts, setPosts] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3001/auth/42/login")
            .then(res => {
                console.log(res);
                setPosts(res.data);
            })
            .catch (err => {
                console.log(err);
            })
    }, [])

    return (
        <div>
            {/* <ul>
                {posts.map(posts => (
                    <li key={posts.id}>{posts.title}</li>
                ))}
            </ul> */}
        </div>
    )
}

export default DataFetching