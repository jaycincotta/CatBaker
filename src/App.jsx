import React, { useContext, useRef, useState } from "react";
import CatBaker from "./assets/CatBaker.png";
import UserProfile from "./Login/UserProfile";
import Navigation from "./Navigation";
import UnsavedChanges from "./UnsavedChanges";
import CategoryBuilder from "./Starter1/CategoryBuilder";
import AppContext from "./Context/AppContext";
import "./styles.css";

export default function App() {
  const { latestVersionId, isDirty, fetchVersion } = useContext(AppContext);
  const [versionRequest, setVersionRequest] = useState(latestVersionId);
  const unsavedChangesDialogRef = useRef();

  function onNavigate(version) {
    if (version !== latestVersionId && isDirty) {
      setVersionRequest(version);
      unsavedChangesDialogRef.current.showModal();
    } else {
      fetchVersion(version);
    }
  }

  return (
    <div className="App">
      <div className="App-header">
        <AppIcon />
        <Navigation onNavigate={onNavigate} />
        <UserProfile />
      </div>
      <CategoryBuilder />
      <UnsavedChanges
        dialogRef={unsavedChangesDialogRef}
        version={versionRequest}
      />
    </div>
  );
}

function AppIcon() {
  return (
    <img
      src={CatBaker}
      alt="Cat Baker"
      style={{ width: "128px", height: "128px" }}
    />
  );
}
