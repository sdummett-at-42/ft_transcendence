import React from "react";
import "./Home.css"

export default function Home() {

    class Tooltip extends React.Component {
        render() {
            return (
                <div style={{ position: 'relative' }}>
                    <button>Hover me</button>
                    <div className="tooltip">Hello World!</div>
                </div>
            );
        }
    }

    return (
        <div>
            <Tooltip />
        </div>
    );
}