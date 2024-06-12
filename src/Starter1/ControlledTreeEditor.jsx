import React, { useEffect, useState, useRef } from "react";
import { Tree, ControlledTreeEnvironment } from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import AppLock from "../AppLock";
import SelectUser from "../Login/SelectUser";
import Save from "../Save";
import { validateLines, buildTreeData } from "../TextParser";

// CustomTreeDataProvider to manage dynamic data
const useCustomTreeDataProvider = (initialText) => {
  const [items, setItems] = useState();
  const [error, setError] = useState();

  useEffect(() => {}, [initialText]);

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

  return {
    getTreeItem,
    getChildren,
    updateItem,
    onChangeItemChildren,
    onRenameItem,
    refreshData: buildItems,
    items,
    error,
  };
};

export default function ControlledTreeEditor({ text, onChange }) {
  const environmentRef = useRef();
  const [collapsedCount, setCollapsedCount] = useState(0);
  const [items, setItems] = useState();
  const [focusedItem, setFocusedItem] = useState();
  const [expandedItems, setExpandedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
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
    setExpandedItems(Object.keys(generatedData));
  }, [text]);

  const onChangeItemChildren = (itemId, newChildren) => {
    setItems((prevItems) => {
      const updatedItems = {
        ...prevItems,
        [itemId]: {
          ...prevItems[itemId],
          children: newChildren,
        },
      };
      console.log(updatedItems);
      return updatedItems;
    });
  };

  const onRenameItem = (item, name) => {
    setItems((prevItems) => {
      const updatedItems = {
        ...prevItems,
        [item.index]: {
          ...prevItems[item.index],
          data: {
            ...prevItems[item.index].data,
            caption: name,
          },
        },
      };
      buildItemsText(updatedItems);
      return updatedItems;
    });
  };

  function buildItemsText(items) {
    let text = "";

    environmentRef.current.linearItems.tree.forEach((treeNode) => {
      const currentNode = items[treeNode.item];
      text += `${"-".repeat(treeNode.depth)}${currentNode.data.caption}`;
      if (currentNode.data.dataId) text += `=${currentNode.data.dataId}`;
      text += "\n";
    });

    onChange(text);
  }

  function onExpandItem(item) {
    setExpandedItems([...expandedItems, item.index]);
    if (item.children.length === 0) return;
    setCollapsedCount((count) => {
      if (count <= 0) return 0;
      return count - 1;
    });
  }

  function onCollapseItem(item) {
    setExpandedItems(
      expandedItems.filter(
        (expandedItemIndex) => expandedItemIndex !== item.index,
      ),
    );
    if (item.children.length === 0) return;
    setCollapsedCount((count) => count + 1);
  }

  function onUnlockDragAndDrop() {
    console.log("Unlcoking");
    setCollapsedCount(0);
    setExpandedItems(Object.keys(items));
  }

  if (error) {
    return (
      <div className="error">
        <i className="fa fa-exclamation-triangle" />
        <p>
          Error on line: {error.lineNumber} "{error.lineText}"
          <br />
          {error.message}
        </p>
      </div>
    );
  }

  if (!items) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      <div className="output-section">
        <ControlledTreeEnvironment
          items={items}
          canDragAndDrop={collapsedCount === 0}
          canDropOnFolder={true}
          canDropOnNonFolder={true}
          canReorderItems={true}
          canRename={true}
          onCollapseItem={onCollapseItem}
          onExpandItem={onExpandItem}
          ref={environmentRef}
          getItemTitle={(item) => item.data.caption}
          //   onDrop={onRenameItem}
          onRenameItem={onRenameItem}
          viewState={{
            ["tree"]: {
              focusedItem,
              expandedItems,
              selectedItems,
            },
          }}
          onFocusItem={(item) => setFocusedItem(item.index)}
          onSelectItems={(items) => setSelectedItems(items)}
        >
          <Tree treeId="tree" rootItem="root" treeLabel="Tree Editor" />
        </ControlledTreeEnvironment>
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
