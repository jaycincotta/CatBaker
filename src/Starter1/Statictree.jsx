import React, { useState, useEffect, useRef } from "react";
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import AppLock from "../AppLock";
import SelectUser from "../Login/SelectUser";
import Save from "../Save";
import { validateLines, buildTreeData } from "../TextParser";

export default function StaticTree({ text, onChange }) {
  const [generatedItems, setGeneratedItems] = useState(null);
  const [dataProvider, setDataProvider] = useState(null);
  const [collapsedCount, setCollapsedCount] = useState(0);
  const treeRef = useRef();
  const environmentRef = useRef();

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

  function onDrop(source, target) {
    console.log(dataProvider.data.items);
    console.log(source);
    console.log(target);
  }

  function onItemChanged() {
    let text = "";
    environmentRef.current.linearItems.tree.forEach((treeNode) => {
      const currentNode = dataProvider.data.items[treeNode.item];
      text += `${"-".repeat(treeNode.depth)}${currentNode.data.caption}`;
      if (currentNode.data.dataId) text += `=${currentNode.data.dataId}`;
      text += "\n";
    });

    onChange(text);
  }

  function onExpandItem(item) {
    if (item.children.length === 0) return;
    setCollapsedCount((count) => {
      if (count <= 0) return 0;
      return count - 1;
    });
  }

  function onCollapseItem(item) {
    if (item.children.length === 0) return;
    setCollapsedCount((count) => count + 1);
  }

  function onUnlockDragAndDrop() {
    setCollapsedCount(0);
    environmentRef.current.expandAll("tree");
  }

  if (!dataProvider) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      <div className="output-section">
        <UncontrolledTreeEnvironment
          key={text}
          ref={environmentRef}
          canDragAndDrop={collapsedCount === 0}
          canDropOnFolder={true}
          canReorderItems={true}
          onDrop={onDrop}
          onRenameItem={onItemChanged}
          onCollapseItem={onCollapseItem}
          onExpandItem={onExpandItem}
          dataProvider={dataProvider}
          getItemTitle={(item) => item.data.caption}
          viewState={{
            tree: {
              expandedItems: Object.keys(generatedItems || sampleItems),
            },
          }}
        >
          <Tree
            ref={treeRef}
            treeId="tree"
            rootItem="root"
            treeLabel="Categories"
          />
        </UncontrolledTreeEnvironment>
      </div>
      <div className="toolbar">
        <div className="toolbar-top">
          <AppLock
            isLocked={collapsedCount > 0}
            onClick={onUnlockDragAndDrop}
          />
          <Save />
        </div>
        <SelectUser />
      </div>
    </React.Fragment>
  );
}

const formatErrorMessage = (lineNumber, message, lineText) => (
  <div>
    <div className="error-message">{message}</div>
    line {lineNumber}: <code>{lineText}</code>
  </div>
);
