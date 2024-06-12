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

    console.log(items);

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

  //
  function onDrop(sourceArray, target) {
    console.log(sourceArray);
    console.log(target);
    const source = sourceArray[0];

    // // Maintain the linearItems array in the environmentRef

    // // insert item in new index (linearIndex)
    // const linearItems = environmentRef.current.linearItems.tree;
    // const linearItem = linearItems.find((c) => c.item === source.index);

    // // update the depth
    // linearItem.depth =
    //   target.targetType === "item" ? target.depth + 1 : target.depth;

    // // remove item from it's current position
    // const filteredLinearItems = linearItems.filter(
    //   (c) => c.item === source.index,
    // );

    // // insert item in new index (linearIndex)
    // filteredLinearItems.splice(target.linearIndex, 0, linearItem);

    // console.log("LinearItems", environmentRef.current.linearItems.tree);

    const tempItems = { ...items };
    const itemsArray = Object.values(tempItems);
    const oldParent = itemsArray.find((c) => {
      if (!c.children) return false;
      return c.children.find((i) => i === source.index);
    });

    // Adds item to new parent's children array

    // Remove item from old parent
    oldParent.children = oldParent.children.filter((i) => i !== source.index);

    // Add item to new parent in correct order using childIndex
    const targetItem = target.targetItem ?? target.parentItem;
    console.log(
      "Before",
      tempItems[targetItem]?.data?.caption ?? tempItems[targetItem].index,
      tempItems[targetItem].children,
    );
    tempItems[targetItem].children.splice(target.childIndex, 0, source.index);
    console.log(
      "After",
      tempItems[targetItem]?.data?.caption ?? tempItems[targetItem].index,
      tempItems[targetItem].children,
    );

    // Assign old parent with updated children
    tempItems[oldParent.index] = oldParent;

    // Moves the item to new position in the items object
    // Remove the item from the array using filter and reassign the result back to itemsArray
    const filteredItemsArray = Object.values(tempItems).filter(
      (c) => c.index !== source.index,
    );

    // Insert the item at the target linear index
    filteredItemsArray.splice(target.linearIndex, 0, source);

    let indexCounter = 0;
    const itemsObject = filteredItemsArray.reduce((acc, item) => {
      if (item.index === "root") {
        acc["root"] = item;
        return acc;
      }
      acc[`item-${indexCounter}`] = item;
      indexCounter++;
      return acc;
    }, {});

    setItems(tempItems);
    buildItemsText(tempItems);
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
          onDrop={onDrop}
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
          renderItemTitle={({ title }) => <p>{title}</p>}
          renderItemArrow={({ item, context }) => {
            // console.log(item);
            return item.children && item.children.length > 0 ? (
              <span {...context.arrowProps}>
                {context.isExpanded ? (
                  <i className="fa-solid fa-folder-open tree-item-arrow"></i>
                ) : (
                  <i className="fa-solid fa-folder tree-item-arrow"></i>
                )}
              </span>
            ) : (
              <i class="fa-regular fa-file tree-item-arrow"></i>
            );
          }}
          renderItem={({ title, arrow, depth, context, children: item }) => {
            return (
              <li
                {...context.itemContainerWithChildrenProps}
                className="tree-item-container"
              >
                <button
                  {...context.itemContainerWithoutChildrenProps}
                  {...context.interactiveElementProps}
                  className="tree-item"
                  style={{ marginLeft: depth * 20 + "px" }}
                >
                  {arrow}
                  {title}
                </button>
                {item}
              </li>
            );
          }}
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
