import React, { useState, useEffect } from "react";
import AppContext from "./AppContext";
import Users from "../Login/Users.json";

export default function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const guest = Users.find((user) => user.UserId == "Guest");

    if (userId) {
      const match = Users.find((user) => user.UserId == userId);
      setUser(match);
    } else {
      setUser(guest);
    }
    setGuest(guest);

    const users = Users.filter((user) => user.UserId != "Guest");
    setUsers(users);
  }, []);

  function login(user) {
    localStorage.setItem("userId", user.UserId);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("userId");
    setUser(guest);
  }

  const context = {
    login: login,
    logout: logout,
    user: user,
    users: users,
  };

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
