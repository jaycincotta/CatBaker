import React, { useState, useEffect, useContext } from "react";
import ParseText from "./ParseText";
import useLoadTextFile from "../useLoadTextFile";
import "./styles.css";
import AppContext from "../Context/AppContext";

const Tester = () => {
  const defaultText = useLoadTextFile("/sampleText.txt");
  const [inputText, setInputText] = useState("");
  const [parsedText, setParsedText] = useState("");
  const { setTreeText } = useContext(AppContext);

  useEffect(() => {
    if (defaultText) {
      setInputText(defaultText);
      setParsedText(defaultText);
      setTreeText(defaultText);
    }
  }, [defaultText]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setParsedText(e.target.value);
    setTreeText(e.target.value);
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
      {!!parsedText && (
        <ParseText text={parsedText} onChange={(text) => setInputText(text)} />
      )}
    </div>
  );
};

export default Tester;
