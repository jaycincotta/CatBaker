import React, { useContext } from "react";
import "./styles.css";
import AppContext from "./Context/AppContext";

const AppLock = ({ onClick }) => {
  const { collapsedCount } = useContext(AppContext);
  const isLocked = collapsedCount > 0;
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
