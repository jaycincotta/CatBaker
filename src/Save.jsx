import React, { useContext, useRef } from "react";
import AppContext from "./Context/AppContext";

export default function Save() {
  const { saveVersion } = useContext(AppContext);
  const dialogRef = useRef();
  const remarkRef = useRef();

  function handleSaveClick() {
    dialogRef.current.showModal();
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
      <i className="fa-solid fa-floppy-disk" onClick={handleSaveClick}></i>
      <dialog ref={dialogRef}>
        <h1>Add remark</h1>
        <textarea ref={remarkRef} />
        <button onClick={handleSave}>Save</button>
        <button onClick={() => dialogRef.current.close()}>Cancel</button>
      </dialog>
    </div>
  );
}
