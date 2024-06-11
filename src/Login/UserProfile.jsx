import React, { useContext } from "react";
import AppContext from "../Context/AppContext";
import "./styles.css";

export default function UserProfile() {
  const { user } = useContext(AppContext);
  return (
    <div className="user-profile">
      {user && <img src={user.SlackImg} alt="User Profile" />}
    </div>
  );
}
