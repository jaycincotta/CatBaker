import React, { useRef } from "react";

export default function Help() {
  const dialogRef = useRef();

  return (
    <div>
      <i
        className="info fa-regular fa-circle-info"
        onClick={() => dialogRef.current.showModal()}
      ></i>
      <dialog ref={dialogRef}>
        <i
          className="fa-solid fa-xmark close-button"
          onClick={() => dialogRef.current.close()}
        ></i>
        <h4>How to use this tool:</h4>
        <HelpContent />
      </dialog>
    </div>
  );
}

export function HelpContent() {
  return (
    <ol>
      <li>
        Edit text in LEFT column (adding a hyphen '-' prefix creates a Child)
      </li>
      <li>Check that total line length of text fits within the RIGHT column</li>
      <li>When done editing, SAVE changes by clicking the orange disk icon</li>
      <li>To EXIT (without saving changes), click the black 'X' icon</li>
    </ol>
  );
}
