import React, { useContext } from "react";
import AppContext from "./Context/AppContext";
import "./styles.css";

export default function Navigation({ onNavigate }) {
  const { version, latestVersionId } = useContext(AppContext);

  return (
    latestVersionId > 0 && (
      <div className="navigation">
        <i
          onClick={() => onNavigate(1)}
          className="fa-solid fa-backward-step"
        ></i>
        <i
          onClick={() => onNavigate(version.Id - 1)}
          className="fa-solid fa-caret-left"
        ></i>
        <p>
          {version?.Id}/{latestVersionId}
        </p>
        <i
          onClick={() => onNavigate(version.Id + 1)}
          className="fa-solid fa-caret-right"
        ></i>
        <i
          onClick={() => onNavigate()}
          className="fa-solid fa-forward-step"
        ></i>
        <div className="version-remark">
          {version?.SlackImg && (
            <img src={version?.SlackImg} alt="user-profile" />
          )}
          <div className="version-text">
            {version?.TimeStamp && (
              <span>{formateDate(version?.TimeStamp)}</span>
            )}
            {version?.Remark && <p>{version?.Remark}</p>}
          </div>
        </div>
      </div>
    )
  );
}

function formateDate(date) {
  // format date in the following format Tuesday 6/11 10:00 AM
  const day = new Date(date).toLocaleDateString();
  const time = new Date(date).toLocaleTimeString();
  return `${day} ${time}`;
}
