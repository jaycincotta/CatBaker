import React, { useState, useEffect, useContext } from "react";
import ParseText from "./ParseText";
import useLoadTextFile from "../useLoadTextFile";
import "./styles.css";
import AppContext from "../Context/AppContext";

const Tester = () => {
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
    setInputText(e.target.value);
    setTreeText(e.target.value);
  };

  const handleTreeChange = (text) => {
    setInputText(text);
    setTreeText(text);
  };

  return (
    <div className="container">
      <div className="input-section">
        <textarea
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter text here"
          style={{ resize: "none" }} // Disable resizing
        />
      </div>
      {!!inputText && (
        <ParseText text={inputText} onChange={handleTreeChange} />
      )}
    </div>
  );
};

export default Tester;
