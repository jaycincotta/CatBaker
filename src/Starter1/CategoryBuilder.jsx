import React, { useState, useEffect, useContext, useRef } from "react";
import useLoadTextFile from "../useLoadTextFile";
import AppContext from "../Context/AppContext";
import ControlledTreeEditor from "./ControlledTreeEditor";
import "./styles.css";

export default function CategoryBuilder({ treeEditorRef }) {
  const { setTreeText, version } = useContext(AppContext);
  const defaultText = useLoadTextFile("/sampleText.txt");
  const [inputText, setInputText] = useState(
    version ? version.TreeData : defaultText,
  );
  const inputRef = useRef();

  useEffect(() => {
    if (version) {
      setInputText(version.TreeData);
      setTreeText(version.TreeData);
      inputRef.current.value = version.TreeData;
    } else {
      setInputText(defaultText);
      // setTreeText(defaultText);
      inputRef.current.value = defaultText;
    }
  }, [defaultText, version]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setTreeText(e.target.value);
  };

  const handleTreeChange = (text) => {
    if (text.trim() === inputRef.current.value.trim()) {
      return;
    }
    setInputText(text);
    setTreeText(text);
  };

  return (
    <div className="container">
      <div className="input-section">
        <textarea
          ref={inputRef}
          spellCheck="false"
          value={inputText}
          onChange={handleInputChange}
          onPaste={handleInputChange}
          placeholder="Enter text here"
          style={{ resize: "none" }} // Disable resizing
        />
      </div>
      {!!inputText && (
        <ControlledTreeEditor
          text={inputText}
          onChange={handleTreeChange}
          ref={treeEditorRef}
        />
      )}
    </div>
  );
}
