import React from "react";
import SearchResult from "../SearchResult/SearchResult";
import "./SearchBarResultsList.css"

export default function SearchResultsList({ results }) {

    return (
        <div className="SearchBar-results-list">
            {
                results.map((result, id) => {
                    return (
                        <SearchResult result={result} key={id} />
                    );
                })
            }
        </div>
    )
}