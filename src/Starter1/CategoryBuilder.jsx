import React, { useState, useEffect, useContext } from "react";
import useLoadTextFile from "../useLoadTextFile";
import AppContext from "../Context/AppContext";
import TreeEditor from "./TreeEditor";
import "./styles.css";

export default function CategoryBuilder() {
  const { setTreeText, version } = useContext(AppContext);
  const defaultText = useLoadTextFile("/sampleText.txt");
  const [inputText, setInputText] = useState(
    version ? version.TreeData : defaultText,
  );

  useEffect(() => {
    if (version) {
      setInputText(version.TreeData);
      setTreeText(version.TreeData);
    } else {
      setInputText(defaultText);
      setTreeText(defaultText);
    }
  }, [defaultText, version]);

  const handleInputChange = (e) => {
    console.log("Input Changed");
    setInputText(e.target.value);
    setTreeText(e.target.value);
  };

  const handleTreeChange = (text) => {
    console.log("Tree Changed");
    setInputText(text);
    setTreeText(text);
  };

  return (
    <div className="container">
      <div className="input-section">
        <textarea
          value={inputText}
          onChange={handleInputChange}
          onPaste={handleInputChange}
          placeholder="Enter text here"
          style={{ resize: "none" }} // Disable resizing
        />
      </div>
      {!!inputText && (
        <TreeEditor text={inputText} onChange={handleTreeChange} />
      )}
    </div>
  );
}
