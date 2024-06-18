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
      <i onClick={handleLogout} className="fa-solid fa-circle-xmark"></i>
      <dialog ref={dialogRef} className="login-modal">
        <h1>Welcome Team!</h1>
        <h4>Click your AVATAR to begin. How to use this tool:</h4>
        <p>
          <ol>
            <li>
              Edit text in LEFT column (adding a hyphen '-' prefix creates a
              Child)
            </li>
            <li>
              Check that total line length of text fits within the RIGHT column
            </li>
            <li>
              When done editing, SAVE changes by clicking the orange disk icon
            </li>
            <li>To EXIT (without saving changes), click the black 'X' icon</li>
          </ol>
        </p>
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
