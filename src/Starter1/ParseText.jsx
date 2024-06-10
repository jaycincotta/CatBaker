import React, { useState, useMemo, useEffect } from "react";
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";

const parse = (line) => {
  let depth = 0;
  while (line[depth] === "-") {
    depth++;
  }
  const trimmedLine = line.slice(depth).trim();
  const [caption, ...dataParts] = trimmedLine
    .split("=")
    .map((part) => part.trim());
  const dataId = dataParts.join("=");
  return {
    caption,
    depth: depth,
    dataId,
  };
};

const formatErrorMessage = (lineNumber, message, lineText) => (
  <div>
    <div className="error-message">{message}</div>
    line {lineNumber}: <code>{lineText}</code>
  </div>
);

const validateLines = (lines) => {
  if (lines.length === 0) return null;

  let previousDepth = -1;
  for (let i = 0; i < lines.length; i++) {
    const parsedLine = parse(lines[i]);
    if (i === 0 && parsedLine.depth !== 0) {
      return formatErrorMessage(
        i + 1,
        "The first category may not be nested.",
        lines[i],
      );
    }
    if (parsedLine.depth > previousDepth + 1) {
      return formatErrorMessage(
        i + 1,
        "Category is too deeply nested",
        lines[i],
      );
    }
    previousDepth = parsedLine.depth;
  }

  return null;
};

const buildTreeData = (lines) => {
  const root = { index: "root", isFolder: true, children: [] };
  const items = { root };
  const parentsStack = [root];

  lines.forEach((line, index) => {
    const parsedLine = parse(line);
    const newItem = {
      index: `item-${index}`,
      data: {
        caption: parsedLine.caption,
        dataId: parsedLine.dataId,
      },
      isFolder: true,
      children: [],
      parentId: null, // Initialize parentId to null
    };

    while (parentsStack.length > parsedLine.depth + 1) {
      parentsStack.pop();
    }

    const currentParent = parentsStack[parentsStack.length - 1];
    currentParent.children.push(newItem.index);
    currentParent.isFolder = true;

    newItem.parentId = currentParent.index; // Set parentId correctly
    items[newItem.index] = newItem;

    if (parsedLine.depth >= parentsStack.length) {
      parentsStack.push(newItem);
    } else {
      parentsStack[parsedLine.depth + 1] = newItem;
    }
  });

  console.log("items", items);
  return items;
};

const ParseText = ({ text, onChange }) => {
  const [generatedItems, setGeneratedItems] = useState(null);
  const [dataProvider, setDataProvider] = useState(null);

  useEffect(() => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const error = validateLines(lines);
    if (error) {
      console.error(error);
      return;
    }

    const generatedData = buildTreeData(lines);
    setGeneratedItems(generatedData);

    const newDataProvider = new StaticTreeDataProvider(
      generatedData,
      handleRenamingEvent,
    );
    setDataProvider(newDataProvider);
  }, [text]);

  function handleRenamingEvent(item, newTitle) {
    return {
      ...item,
      data: {
        ...item.data,
        caption: newTitle,
      },
    };
  }

  function onItemDrop(source, destination) {
    source.parentIndex = destination.index;

    let text = "";
    const itemsArray = Object.entries(dataProvider.data.items).map(
      (keyValuePair) => keyValuePair[1],
    );

    console.log(itemsArray);

    itemsArray.forEach((item) => {
      const depth = getItemDepth(item, itemsArray);
      if (item.index == "root") return;

      if (depth == 0) text += item.data.caption;
      else text += `${"-".repeat(depth)}${item.data.caption}\n`;
    });

    // for (const key in dataProvider.data.items) {
    //   const item = dataProvider.data.items[key];
    //   const depth = getItemDepth(item, itemsArray);
    //   if (depth == 0) text += item.data.caption;
    //   else text += `${"-".repeat(depth)}${item.data.caption}\n`;
    // }

    onChange(text);
  }

  function getItemDepth(item, itemsArray) {
    if (!item.parentIndex || (item.parentIndex && item.parentIndex === "root"))
      return 0;
    const parent = itemsArray.find((c) => c.index === item.parentIndex);
    return getItemDepth(parent) + 1;
  }

  function onItemRename() {
    // TODO
  }

  if (!dataProvider) {
    return <div>Loading...</div>;
  }

  return (
    <UncontrolledTreeEnvironment
      key={text}
      canDragAndDrop={true}
      canDropOnFolder={true}
      canReorderItems={true}
      onDrop={onItemDrop}
      onRenameItem={onItemRename}
      dataProvider={dataProvider}
      getItemTitle={(item) => item.data.caption}
      viewState={{
        tree: {
          expandedItems: Object.keys(generatedItems || sampleItems),
        },
      }}
    >
      <Tree treeId="tree" rootItem="root" treeLabel="Categories" />
    </UncontrolledTreeEnvironment>
  );
};

export default ParseText;
