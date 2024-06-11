import React, { useState } from "react";
import "./styles.css";

const AppLock = () => {
  const [isLocked, setIsLocked] = useState(true);

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  return (
    <div
      className={`App-lock ${isLocked ? "locked" : "unlocked"}`}
      onClick={toggleLock}
    >
      <i className={`fa-solid ${isLocked ? "fa-lock" : "fa-unlock"}`}></i>
    </div>
  );
};

export default AppLock;
