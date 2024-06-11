import React, { useContext, useEffect, useRef } from "react";
import AppContext from "../Context/AppContext";
import "./styles.css";

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
      <i onClick={handleLogout} className="fa-solid fa-person-to-door"></i>
      <dialog ref={dialogRef} className="login-modal">
        <h1>Login</h1>
        <ul className="users">
          {users.map((user) => (
            <li key={user.UserId} onClick={() => handleUserClick(user)}>
              <img src={user.SlackImg} />
            </li>
          ))}
        </ul>
        <div className="App-title">
          We're cooking up the successor to CatMaker!
        </div>
      </dialog>
    </div>
  );
}
