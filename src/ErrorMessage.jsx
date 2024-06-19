import React from "react";

export default function ErrorMessage({ children }) {
  return (
    <div className="error">
      <i className="fa fa-exclamation-triangle" />
      <p>{children}</p>
    </div>
  );
}
