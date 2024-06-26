import React, { useContext, useRef, useState } from "react";
import CatBaker from "./assets/CatBaker-horiz.png";
import UserProfile from "./Login/UserProfile";
import Navigation from "./Navigation";
import UnsavedChanges from "./UnsavedChanges";
import CategoryBuilder from "./Starter1/CategoryBuilder";
import AppContext from "./Context/AppContext";
import AppLock from "./AppLock";
import Save from "./Save";
import Help from "./Help";
import SelectUser from "./Login/SelectUser";
import "./styles.css";

export default function App() {
  const { latestVersionId, isDirty, fetchVersion } = useContext(AppContext);
  const [versionRequest, setVersionRequest] = useState(latestVersionId);
  const unsavedChangesDialogRef = useRef();
  const treeEditorRef = useRef();

  function onNavigate(version) {
    if (version !== latestVersionId && isDirty) {
      setVersionRequest(version);
      unsavedChangesDialogRef.current.showModal();
    } else {
      fetchVersion(version);
    }
  }

  function handleLockClick() {
    treeEditorRef.current.collapseExpand();
  }

  return (
    <div className="App">
      <div className="App-header">
        <AppIcon />
        <Navigation onNavigate={onNavigate} />
        <UserProfile />
      </div>
      <div className="App-content">
        <CategoryBuilder treeEditorRef={treeEditorRef} />
        <div className="toolbar">
          <AppLock onClick={handleLockClick} />
          <Save />
          <Help />
          <SelectUser />
        </div>
        <UnsavedChanges
          dialogRef={unsavedChangesDialogRef}
          version={versionRequest}
        />
      </div>
    </div>
  );
}

function AppIcon() {
  return (
    <img
      src={CatBaker}
      alt="Cat Baker"
      style={{ width: "192px", height: "64px" }}
    />
  );
}
