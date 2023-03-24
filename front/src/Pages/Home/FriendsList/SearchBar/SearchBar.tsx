import React, { useState } from "react";
import './SearchBar.css';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SearchBar() {

    const [input, setInput] = useState("");
    const [results, setResults] = useState([]);


    // use to send the request to the user
    const sendFriendRequest = ({input}) => {
        console.log(input);
    }

    // fetch user database
    const fetchData = (value) => {
        fetch("https://jsonplaceholder.typicode.com/users")
            .then((response) => response.json())
            .then(json => {
                const results = json.filter((user) => {
                    return (
                        value &&
                        user &&
                        user.name &&
                        user.name.toLowerCase().includes(value.toLowerCase()) &&
                        value !== user.name
                    );
                })
                setResults(results);
            });
    }

    // when user type in search bar
    const handleChange = (value) => {
        setInput(value);
        fetchData(value);
    }

    // when user clic on suggestion
    const handleSuggestion = (value) => {
        setInput(value);
        fetchData(value);
    }

    return (
        <div>
            <div className="SearchBar-input-wrapper">
                <input
                    id="SearchBar-input"
                    placeholder="Nom d'utilisateur"
                    value={input}
                    onChange={(e) => handleChange(e.target.value)}
                    autoComplete="off"
                    />
                <button id="SearchBar-add-user-button" onClick={() => sendFriendRequest({input})}>
                    <FontAwesomeIcon icon={faUserPlus} size="lg" id="SearchBar-add-user-icon" />
                </button>
            </div>

            <div className="SearchBar-results-list">
                {
                    results.map((result, id) => (
                        <div onClick={() => handleSuggestion(result.name)} className="SearchBar-search-result" key={id} >
                            {result.name}
                        </div>
                    ))
                }
            </div>
        </div>
    );
}