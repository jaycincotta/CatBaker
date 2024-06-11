import React, { useContext } from "react";
import AppContext from "./Context/AppContext";
import "./styles.css";

export default function Navigation() {
  const { fetchVersion, version, latestVersionId } = useContext(AppContext);

  return (
    latestVersionId > 0 && (
      <div className="navigation">
        <i
          onClick={() => fetchVersion(1)}
          className="fa-solid fa-backward-step"
        ></i>
        <i
          onClick={() => fetchVersion(version.Id - 1)}
          className="fa-solid fa-circle-caret-left"
        ></i>
        <p>
          {version?.Id}/{latestVersionId}
        </p>
        <i
          onClick={() => fetchVersion(version.Id + 1)}
          className="fa-solid fa-circle-caret-right"
        ></i>
        <i
          onClick={() => fetchVersion()}
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
