import React, { useContext, useEffect, useRef } from "react";
import AppContext from "../Context/AppContext";

export default function UnsavedChanges() {
  const { isDirty, version } = useContext(AppContext);
  const dialogRef = useRef();

  useEffect(() => {
    if (!isDirty) return;
    dialogRef.showModal();
  }, [isDirty, version]);

  return (
    <dialog className="unsaved-changes" ref={dialogRef}>
      <h1>Unsaved Changes</h1>
      <p>You have unsaved changes. Do you want to save them?</p>
      <button>Save</button>
      <button>Discard</button>
    </dialog>
  );
}
