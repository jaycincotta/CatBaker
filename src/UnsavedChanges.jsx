import React, { useContext, useRef, useState } from "react";
import AppContext from "./Context/AppContext";
import ErrorMessage from "./ErrorMessage";

export default function UnsavedChanges({ dialogRef, version }) {
  const { fetchVersion, saveVersion } = useContext(AppContext);
  const [error, setError] = useState();
  const remarkRef = useRef();

  function handleSave() {
    function success() {
      remarkRef.current.value = "";
      fetchVersion(version);
      dialogRef.current.close();
    }

    function failed(err) {
      setError(`Sorry, something went wrong. Error: ${err}`);
    }

    saveVersion(remarkRef.current.value, success, failed);
  }

  function handleDiscard() {
    fetchVersion(version);
    dialogRef.current.close();
  }

  return (
    <React.Fragment>
      <dialog className="save" ref={dialogRef}>
        <h2>You Have Unsaved Changes</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <p>Do you want to save your changes before continuing?</p>
        <textarea ref={remarkRef} />
        <button className="save-btn" onClick={handleSave}>
          Yes, Save
        </button>
        <button className="cancel-btn" onClick={handleDiscard}>
          No, Discard
        </button>
      </dialog>
    </React.Fragment>
  );
}
