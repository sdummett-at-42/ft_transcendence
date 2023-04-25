import React from "react";
import "./Popup.css";

const Popup = ({ isOpen, children, isClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div>
            <div className="Popup">
                <div className="Popup-content">
                    {children}
                    <button className="Popup-close-button" onClick={isClose} >
						X
					</button>
                </div>
            </div>
        </div>
    );
};

export default Popup;