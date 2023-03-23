import React from "react";
import "./SearchBarResult.css"

export default function SearchResult({ result }) {

    return (
        <div
            className="SearchBar-search-result"
            onClick={(e) => alert(`You clicked on ${result.name}`)}
            /* Send request to the user */
        >
            {result.name}
        </div>
    )
}