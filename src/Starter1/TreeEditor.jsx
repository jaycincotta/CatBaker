import React, { useEffect, useState, useRef } from "react";
import { UncontrolledTreeEnvironment, Tree } from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import AppLock from "../AppLock";
import SelectUser from "../Login/SelectUser";
import Save from "../Save";
import { validateLines, buildTreeData } from "../TextParser";

// CustomTreeDataProvider to manage dynamic data
const CustomTreeDataProvider = (text) => {
  const [items, setItems] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    const error = validateLines(lines);
    setError(error);
    if (error) {
      console.error(error);
      return;
    }
    const generatedData = buildTreeData(lines);
    setItems(generatedData);
  }, [text]);

  const getTreeItem = async (itemId) => items[itemId];

  const getChildren = async (itemId) => items[itemId].children;

  const updateItem = (itemId, newData) => {
    setItems((prevItems) => ({
      ...prevItems,
      [itemId]: {
        ...prevItems[itemId],
        data: newData,
      },
    }));
  };

  const onChangeItemChildren = (itemId, newChildren) => {
    items[itemId].children = newChildren;
  };

  const onRenameItem = (item, name) => {
    items[item.index].data.caption = name;
  };

  return {
    getTreeItem,
    getChildren,
    updateItem,
    onChangeItemChildren,
    onRenameItem,
    items,
    error,
  };
};

export default function TreeEditor({ text, onChange }) {
  const environmentRef = useRef();
  const dataProvider = CustomTreeDataProvider(text);
  const [collapsedCount, setCollapsedCount] = useState(0);

  function onItemChanged() {
    let text = "";

    environmentRef.current.linearItems.tree.forEach((treeNode) => {
      const currentNode = dataProvider.items[treeNode.item];
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

  if (dataProvider.error) {
    return (
      <div className="error">
        <i className="fa fa-exclamation-triangle" />
        <p>
          Error on line: {dataProvider.error.lineNumber} "
          {dataProvider.error.lineText}"
          <br />
          {dataProvider.error.message}
        </p>
      </div>
    );
  }
  if (!dataProvider || (dataProvider && !dataProvider.items)) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      <div className="output-section">
        <UncontrolledTreeEnvironment
          key={text}
          canDragAndDrop={collapsedCount === 0}
          canDropOnFolder={true}
          canReorderItems={true}
          onCollapseItem={onCollapseItem}
          onExpandItem={onExpandItem}
          ref={environmentRef}
          getItemTitle={(item) => item.data.caption}
          dataProvider={dataProvider}
          onDrop={onItemChanged}
          onRenameItem={onItemChanged}
          viewState={{
            ["tree"]: {
              expandedItems: Object.keys(dataProvider.items),
            },
          }}
        >
          <Tree treeId="tree" rootItem="root" treeLabel="Tree Editor" />
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
