import React, { useContext, useEffect, useRef } from "react";
import AppContext from "../Context/AppContext";
import "./styles.css";
import { HelpContent } from "../Help";

export default function SelectUser() {
  const dialogRef = useRef();
  const { login, logout, users } = useContext(AppContext);

  useEffect(() => {
    const localStorageUserId = localStorage.getItem("userId");
    if (!localStorageUserId) {
      dialogRef.current.showModal();
    }
  }, []);

  function handleUserClick(user) {
    login(user);
    dialogRef.current.close();
  }

  function handleLogout() {
    logout();
    dialogRef.current.showModal();
  }

  return (
    <div className="select-user">
      <i onClick={handleLogout} className="fa-solid fa-circle-xmark"></i>
      <dialog ref={dialogRef} className="login-modal">
        <h1>Welcome Team!</h1>
        <h4>Click your AVATAR to begin. How to use this tool:</h4>
        <HelpContent />
        <ul className="users">
          {users.map((user) => (
            <li key={user.UserId} onClick={() => handleUserClick(user)}>
              <img src={user.SlackImg} />
            </li>
          ))}
        </ul>

        <div className="App-title"></div>
      </dialog>
    </div>
  );
}
