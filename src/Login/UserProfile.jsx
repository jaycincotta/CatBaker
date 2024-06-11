import React, { useEffect, useState, useContext } from "react";
import Users from "./Users.json";
import AppContext from "../Context/AppContext";
import "./styles.css";

export default function UserProfile() {
  // const [user, setUser] = useState(null);
  const { user } = useContext(AppContext);

  console.log("User Profile", user);

  // useEffect(() => {
  //   const userId = localStorage.getItem("userId");
  //   if (userId) {
  //     const match = Users.find((user) => user.UserId == userId);
  //     setUser(match);
  //   } else {
  //     const guest = Users.find((user) => user.UserId == "Guest");
  //     setUser(guest);
  //   }
  // }, []);

  return (
    <div className="user-profile">
      {user && <img src={user.SlackImg} alt="User Profile" />}
    </div>
  );
}
