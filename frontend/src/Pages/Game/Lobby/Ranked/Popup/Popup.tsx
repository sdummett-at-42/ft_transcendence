import React from "react";

const Popup = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div>
      <div className="popup">
        <div className="popup-content Ranked-popup">{children}
            <button className="Ranked-popup-close" onClick={onClose}>
                Quitter la file d'attente
            </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;