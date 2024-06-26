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
    inputRef.current.value = text;
    setTreeText(text);
  };

  const handleSelect = () => {
    selectTreeItem();
  };

  const handleKeyUp = (e) => {
    if (e.key.includes("Arrow")) {
      selectTreeItem();
    }
    // Disabling renaming, as it causes the text-id property to become stale if not updated. Updating a single text-id property isn't sufficient, if the tree item is a parent then the children's text-id properties will also be stale.
    // else if (e.key === "F2") {
    //   treeEditorRef.current.focusSelectedItem();
    // }
  };

  const selectTreeItem = () => {
    const focusedLine = findFocusedLine();
    treeEditorRef.current.selectItem(
      `${focusedLine.parent}|${focusedLine.line}`,
    );
  };

  const findFocusedLine = () => {
    // find start of current line
    let startOfLineIndex = 0;
    const text = inputRef.current.value;
    for (let index = inputRef.current.selectionStart - 1; index > 0; index--) {
      const char = text[index];
      if (char === "\n") {
        startOfLineIndex = index;
        break;
      }
    }

    // find end of current line
    let endOfLineIndex = 0;
    for (
      let index = inputRef.current.selectionStart;
      index < text.length;
      index++
    ) {
      const char = text[index];
      if (char === "\n") {
        endOfLineIndex = index;
        break;
      }
    }

    const parent = findParent(startOfLineIndex, endOfLineIndex);

    // return text beween start and end
    return {
      parent: parent,
      line: text.substring(startOfLineIndex, endOfLineIndex).replace(/^\n/, ""),
    };
  };

  const findParent = (startOfLineIndex, endOfLineIndex) => {
    const lines = inputRef.current.value.split("\n");
    let charCounter = 0;
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      charCounter += line.length + 1;
      if (charCounter >= startOfLineIndex && charCounter <= endOfLineIndex) {
        for (let i = index; i > -1; i--) {
          const prev = lines[i];
          const match = prev.match(/^[-]+/); // Match one or more dashes at the beginning of the string
          const dashCount = match ? match[0].length : 0;
          if (dashCount === 0) {
            return prev;
          }
        }
      }
    }
  };

  const handleTreeItemSelection = (text) => {
    const selectedItemTextLines = text.split("|");
    const parent = selectedItemTextLines[0];
    const child = selectedItemTextLines[1];

    const lines = inputRef.current.value.split("\n");
    let lineIndex = 0;
    let textStartIndex = 0;

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];

      if (line === child) {
        if (parent === "root") {
          lineIndex = index;
          break;
        } else {
          let currParent = "";
          for (let i = index; i > -1; i--) {
            const prev = lines[i];
            const match = prev.match(/^[-]+/); // Match one or more dashes at the beginning of the string
            const dashCount = match ? match[0].length : 0;

            if (dashCount === 0) {
              currParent = prev;
              break;
            }
          }

          if (currParent === parent) {
            lineIndex = index;
            break;
          }
        }
      }

      textStartIndex += line.length + 1;
    }

    const lineHeight = 31.5;
    const scrollPosition = lineIndex * lineHeight - 40;

    inputRef.current.scrollTo({ top: scrollPosition, behavior: "smooth" });

    inputRef.current.setSelectionRange(
      textStartIndex,
      textStartIndex + child.length,
    );
    inputRef.current.focus();
  };

  return (
    <div className="container">
      <div className="input-section">
        <textarea
          ref={inputRef}
          spellCheck="false"
          onChange={handleInputChange}
          onPaste={handleInputChange}
          onKeyUp={handleKeyUp}
          onClick={handleSelect}
          placeholder="Enter text here"
          style={{ resize: "none" }} // Disable resizing
        />
      </div>
      {!!inputText && (
        <ControlledTreeEditor
          text={inputText}
          onChange={handleTreeChange}
          ref={treeEditorRef}
          onItemSelection={handleTreeItemSelection}
        />
      )}
    </div>
  );
}
