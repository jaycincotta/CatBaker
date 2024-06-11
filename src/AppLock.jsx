import React, { useState } from "react";
import "./styles.css";

const AppLock = ({ isLocked, onClick }) => {
  return (
    <div
      className={`App-lock ${isLocked ? "locked" : "unlocked"}`}
      onClick={onClick}
    >
      <i className={`fa-solid ${isLocked ? "fa-lock" : "fa-unlock"}`}></i>
    </div>
  );
};

export default AppLock;
