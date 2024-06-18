import React, { useContext, useRef } from "react";
import AppContext from "./Context/AppContext";

export default function Save() {
  const { saveVersion, version, latestVersionId, isDirty } =
    useContext(AppContext);
  const dialogRef = useRef();
  const remarkRef = useRef();

  const enabled = version !== latestVersionId || isDirty;
  const enabledClassName = enabled ? "save-enabled" : "save-disabled";

  function handleSaveIconClick() {
    if (enabled) dialogRef.current.showModal();
  }

  function handleSave() {
    const success = () => {
      dialogRef.current.close();
      remarkRef.current.value = "";
    };
    const failed = () => {};
    saveVersion(remarkRef.current.value, success, failed);
  }

  return (
    <div className="save">
      <i
        className={`${enabledClassName} fa-solid fa-floppy-disk`}
        onClick={handleSaveIconClick}
      ></i>
      <dialog ref={dialogRef}>
        <h1>Add remark</h1>
        <textarea ref={remarkRef} />
        <button onClick={handleSave}>Save</button>
        <button onClick={() => dialogRef.current.close()}>Cancel</button>
      </dialog>
    </div>
  );
}
