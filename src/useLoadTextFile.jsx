import { useState, useEffect } from "react";

const useLoadTextFile = (filePath) => {
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(filePath)
      .then((response) => response.text())
      .then((data) => setText(data))
      .catch((error) => console.error("Error loading text file:", error));
  }, [filePath]);

  return text;
};

export default useLoadTextFile;
