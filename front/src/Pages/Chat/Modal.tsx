import React from 'react';
import { useRef, useEffect } from "react";

export default function Modal({ close }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!ref?.current?.contains(e.target)) {
        console.log("This one gets called because of the button click", e);
        close();
      }
    };

    document.addEventListener("click", handleOutsideClick, false);
    return () => {
      document.removeEventListener("click", handleOutsideClick, false);
    };
  }, [close]);

  return (
    <div ref={ref} className="Modal">
      <h1>I'm a Modal!</h1>
    </div>
  );
}
