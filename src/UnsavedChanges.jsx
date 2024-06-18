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
        <h1>Unsaved Changes</h1>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <p>
          You have unsaved changes. Do you want to save them before moving on?
        </p>
        <textarea ref={remarkRef} />
        <button onClick={handleSave}>Save</button>
        <button onClick={handleDiscard}>Discard</button>
      </dialog>
    </React.Fragment>
  );
}
