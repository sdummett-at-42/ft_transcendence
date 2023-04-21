import React, { useState, useContext } from "react";
import { UserContext } from "../../../../context/UserContext";
import './SearchBar.css';
import { useNavigate } from "react-router-dom";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SearchBar(props) {

    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [input, setInput] = useState("");
    const [results, setResults] = useState([]);

    // use to send the request to the user
    const sendFriendRequest = ({input}) => {
        props.onAddFriend(input);
        setInput('');
        fetchData('');
    }

    // fetch user database
    const fetchData = async (value) => {
        await fetch("http://localhost:3001/users", {
            method: "GET",
            credentials: "include"
        })
            .then (response => {
                if (response.status == 401) {
                    navigate("/unauthorized");
                }
                else if (response.status == 200) {
                    return response;
                }
            })
            .then((response) => response.json())
            .then(json => {
                const result = json.filter((dataUser) => {
                    return (
                        value &&
                        dataUser &&
                        dataUser.name &&
                        dataUser.name.toLowerCase().includes(value.toLowerCase()) &&
                        value !== dataUser.name &&
                        !dataUser.name.toLowerCase().includes(user.name.toLowerCase())
                    );
                })
                setResults(result);
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