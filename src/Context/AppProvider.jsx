import React, { useState, useEffect } from "react";
import AppContext from "./AppContext";
import Users from "../Login/Users.json";
import AppSettings from "../AppSettings";

export default function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(null);
  const [users, setUsers] = useState([]);
  const [version, setVersion] = useState();
  const [latestVersionId, setLatestVersionId] = useState(0);
  const [treeText, setTreeText] = useState("");

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

  useEffect(() => {
    if (!user) return;

    fetchVersion();
  }, [user]);

  function login(user) {
    localStorage.setItem("userId", user.UserId);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("userId");
    setUser(guest);
  }

  function fetchVersion(version) {
    const validVersion = version === 0 ? 1 : version;
    const url = AppSettings.CatBaker.GetVersion(
      user.UserId,
      validVersion ?? "",
    );
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.Id > latestVersionId) setLatestVersionId(data.Id);
        const user = Users.find((user) => user.UserId == data.UserId);
        data.SlackImg = user?.SlackImg;
        setVersion(data);
      })
      .catch((error) => console.log(error));
  }

  function saveVersion(remark, success, failed) {
    const url = AppSettings.CatBaker.PostTree();

    const payload = {
      UserId: user.UserId,
      TreeData: treeText,
      Remark: remark,
    };

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(() => {
        fetchVersion();
        success?.();
      })
      .catch((err) => {
        failed?.();
        console.log(err);
      });
  }

  const context = {
    login: login,
    logout: logout,
    user: user,
    users: users,
    fetchVersion: fetchVersion,
    saveVersion: saveVersion,
    version: version,
    latestVersionId: latestVersionId,
    setTreeText: setTreeText,
    treeText: treeText,
  };

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
