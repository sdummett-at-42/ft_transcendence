import React, { useState, useEffect } from "react";
import axios from "axios";


function DataFetching() {

    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3001/auth/google/login")
            .then(response => {
                console.log(response);
                setData(response.data);
            })
            .catch (err => {
                console.log(err);
            })
    }, [])

    return (
        <div>
            {data.map(item => (
                <div key={item.id}>
                    <p>{item.title}</p>
                    <p>{item.description}</p>
                </div>
            ))}
        </div>
    );
}

export default DataFetching