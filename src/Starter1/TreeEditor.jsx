import React, { useEffect, useState, useRef } from "react";
import { UncontrolledTreeEnvironment, Tree } from "react-complex-tree";
import { validateLines, buildTreeData } from "../TextParser";
import "react-complex-tree/lib/style-modern.css";
import AppLock from "../AppLock";
import SelectUser from "../Login/SelectUser";
import Save from "../Save";

// CustomTreeDataProvider to manage dynamic data
const useCustomTreeDataProvider = (initialText) => {
  const [items, setItems] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    refreshData(initialText);
  }, [initialText]);

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
    console.log("Drag Operation on: ", itemId, "w/ children: ", newChildren);
    setItems((prevItems) => {
      const updatedItems = {
        ...prevItems,
        [itemId]: {
          ...prevItems[itemId],
          children: newChildren,
        },
      };
      console.log("Updated Items:", updatedItems);
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
      return updatedItems;
    });
  };

  const refreshData = (text) => {
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
  };

  return {
    getTreeItem,
    getChildren,
    updateItem,
    onChangeItemChildren,
    onRenameItem,
    refreshData,
    items,
    error,
  };
};

export default function TreeEditor({ text, onChange }) {
  const environmentRef = useRef();
  const dataProvider = useCustomTreeDataProvider(text);
  const [collapsedCount, setCollapsedCount] = useState(0);

  useEffect(() => {
    if (text) dataProvider.refreshData(text);
  }, [text]);

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
          canDragAndDrop={collapsedCount === 0}
          canDropOnFolder={true}
          canReorderItems={true}
          canRenameItem={true}
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
          // renderItemTitle={({ title }) => <p>{title}</p>}
          // renderItemArrow={({ item, context }) => {
          //   return item.children && item.children.length > 0 ? (
          //     <span {...context.arrowProps}>
          //       {context.isExpanded ? (
          //         <i className="fa-solid fa-folder-open tree-item-arrow"></i>
          //       ) : (
          //         <i className="fa-solid fa-folder tree-item-arrow"></i>
          //       )}
          //     </span>
          //   ) : (
          //     <i class="fa-regular fa-file tree-item-arrow"></i>
          //   );
          // }}
          // renderItem={({ title, arrow, depth, context, children: item }) => {
          //   return (
          //     <li
          //       {...context.itemContainerWithChildrenProps}
          //       className="tree-item-container"
          //     >
          //       <button
          //         {...context.itemContainerWithoutChildrenProps}
          //         {...context.interactiveElementProps}
          //         className="tree-item"
          //         style={{ marginLeft: depth * 20 + "px" }}
          //       >
          //         {arrow}
          //         {title}
          //       </button>
          //       {item}
          //     </li>
          //   );
          // }}
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
