import React from "react";

const Popup = ({ isOpen, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div>
      <div className="popup">
        <div className="popup-content">{children}</div>
      </div>
    </div>
  );
};

export default Popup;