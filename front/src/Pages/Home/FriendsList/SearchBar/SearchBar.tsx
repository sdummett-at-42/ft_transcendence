import React, { useState } from "react";
import './SearchBar.css';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SearchBar({setResults}) {

    const [input, setInput] = useState("");

    const fetchData = (value) => {
        // fetch user database
        fetch("https://jsonplaceholder.typicode.com/users")
            .then((response) => response.json())
            .then(json => {
                const results = json.filter((user) => {
                    return (
                        value &&
                        user &&
                        user.name &&
                        user.name.includes(value)
                    );
                })
                setResults(results);
            });
    }

    const handleChange = (value) => {
        setInput(value);
        fetchData(value);
    }

    return (
        <div className="SearchBar-input-wrapper">
            <input
                id="SearchBar-input"
                placeholder="Nom d'utilisateur"
                value={input}
                onChange={(e) => handleChange(e.target.value)}
            />
            <FontAwesomeIcon icon={faUserPlus} id="SearchBar-add-user-icon" />
        </div>
    );
}