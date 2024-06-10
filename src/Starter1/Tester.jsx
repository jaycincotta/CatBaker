import React, { useState, useEffect } from "react";
import ParseText from "./ParseText";
import useLoadTextFile from "../useLoadTextFile";
import "./styles.css";

const Tester = () => {
  const defaultText = useLoadTextFile("/src/data/simpleText.txt");
  const [inputText, setInputText] = useState("");
  const [parsedText, setParsedText] = useState("");

  useEffect(() => {
    if (defaultText) {
      setInputText(defaultText);
      setParsedText(defaultText);
    }
  }, [defaultText]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setParsedText(e.target.value);
  };

  const handleParseClick = () => {
    setParsedText(inputText);
  };

  const handleBlur = () => {
    handleParseClick();
  };

  return (
    <div className="container">
      <div className="input-section">
        <textarea
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="Enter text here"
          style={{ resize: "none" }} // Disable resizing
        />
        {/* <br />
        <button onClick={handleParseClick}>Parse</button> */}
      </div>
      <div className="output-section">
        {!!parsedText && <ParseText text={parsedText} />}
      </div>
    </div>
  );
};

export default Tester;
