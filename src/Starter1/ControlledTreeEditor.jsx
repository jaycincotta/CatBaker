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

    if (JSON.stringify(generatedData) === JSON.stringify(items)) return;

    setItems(generatedData);
    setExpandedItems(Object.keys(generatedData));
  }, [text]);

  useEffect(() => {
    if (!items || !environmentRef?.current?.linearItems?.tree) return;
    buildItemsText(items);
  }, [items]);

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

  function buildItemsText(itemsObject) {
    let text = "";

    environmentRef.current.linearItems.tree.forEach((treeNode) => {
      const currentNode = itemsObject[treeNode.item];
      text += `${"-".repeat(treeNode.depth)}${currentNode.data.caption}`;
      if (currentNode.data.dataId) text += `=${currentNode.data.dataId}`;
      text += "\n";
    });

    onChange(text);
  }

  function onDrop(sourceArray, target) {
    console.log(sourceArray);
    console.log(target);
    const source = sourceArray[0];

    // const newItemsObject = updateParentChildren(source, target);
    // const finalItemsObject = moveItemsPosition(newItemsObject, source, target);
    // // updateLinearItems(source, target);

    // setItems(() => JSON.parse(JSON.stringify(newItemsObject)));
    // buildItemsText(newItemsObject);
  }

  function moveItemsPosition(itemsObject, source, target) {
    // Moves the item to new position in the items object
    // Remove the item from the array using filter and reassign the result back to itemsArray
    const filteredItemsArray = Object.values(itemsObject).filter(
      (c) => c.index !== source.index,
    );

    // Insert the item at the target linear index
    filteredItemsArray.splice(target.linearIndex, 0, source);

    let indexCounter = 0;
    const newObj = filteredItemsArray.reduce((acc, item) => {
      if (item.index === "root") {
        acc["root"] = item;
        return acc;
      }
      acc[`item-${indexCounter}`] = item;
      indexCounter++;
      return acc;
    }, {});
    return newObj;
  }

  function updateParentChildren(source, target) {
    // const tempItems = { ...items };
    // Create a deep copy of the items object
    const tempItems = JSON.parse(JSON.stringify(items));
    const itemsArray = Object.values(tempItems);

    // find source's old parent
    const oldParent = itemsArray.find((c) => {
      if (!c.children) return false;
      return c.children.find((i) => i === source.index);
    });

    // Remove item from old parent
    oldParent.children = oldParent.children.filter((i) => i !== source.index);
    // console.log(
    //   "Old Parent",
    //   oldParent?.data?.caption ?? oldParent.index,
    //   oldParent.children,
    // );

    // Add item to new parent in correct order using childIndex
    const targetItem = target.targetItem ?? target.parentItem;
    // console.log(
    //   "New Parent Before",
    //   tempItems[targetItem]?.data?.caption ?? tempItems[targetItem].index,
    //   tempItems[targetItem].children,
    // );
    tempItems[targetItem].children.splice(target.childIndex, 0, source.index);
    // console.log(
    //   "New Parent After",
    //   tempItems[targetItem]?.data?.caption ?? tempItems[targetItem].index,
    //   tempItems[targetItem].children,
    // );

    // Assign old parent with updated children
    tempItems[oldParent.index] = oldParent;
    // console.log(
    //   "Updated Old Parent in Object",
    //   tempItems[oldParent.index].children,
    // );

    return tempItems;
  }

  function updateLinearItems(source, target) {
    // Maintain the linearItems array in the environmentRef

    // insert item in new index (linearIndex)
    const linearItems = environmentRef.current.linearItems.tree;
    const linearItem = linearItems.find((c) => c.item === source.index);

    // update the depth
    linearItem.depth =
      target.targetType === "item" ? target.depth + 1 : target.depth;

    // // reorder the linearItems array
    // // remove item from it's current position
    // const filteredLinearItems = linearItems.filter(
    //   (c) => c.item === source.index,
    // );

    // // insert item in new index (linearIndex)
    // filteredLinearItems.splice(target.linearIndex, 0, linearItem);

    console.log("LinearItems", environmentRef.current.linearItems.tree);
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

  const onItemsDropped = (items, target) => {
    if (target.targetType === "between-items") {
      setItems((prevData) => {
        if (!prevData) return prevData;
        const parentNode = prevData[target.parentItem];
        const insertIndex = target.childIndex;
        const itemIds = items.map((item) => item.index);

        // Remove the items from their previous parent
        Object.values(prevData).forEach((item) => {
          if (item.children) {
            item.children = item.children.filter(
              (child) => !itemIds.includes(child),
            );
          }
        });

        // Add the items to the new parent at the new position
        const newData = {
          ...prevData,
          [parentNode.index]: {
            ...parentNode,
            children: [
              ...(parentNode.children ?? []).slice(0, insertIndex),
              ...itemIds,
              ...(parentNode.children ?? []).slice(insertIndex),
            ],
          },
        };
        return newData;
      });
    }
    if (target.targetType === "item") {
      setItems((prevData) => {
        if (!prevData) return prevData;
        const parentNode = prevData[target.targetItem];
        const itemIds = items.map((item) => item.index);

        // Remove the items from their previous parent
        Object.values(prevData).forEach((item) => {
          if (item.children) {
            item.children = item.children.filter(
              (child) => !itemIds.includes(child),
            );
          }
        });

        // Add the items to the new parent
        const newData = {
          ...prevData,
          [parentNode.index]: {
            ...parentNode,
            children: [...(parentNode.children ?? []), ...itemIds],
          },
        };

        return newData;
      });
    }
  };

  const renderItemTitle = ({ item, context }) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(item.data.caption);

    console.log(context.isRenaming);

    useEffect(() => {
      setNewName(item.data.caption);
    }, [item.data.caption]);

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "F2" && context.isRenaming) {
          setIsRenaming(true);
          context.startRenaming();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isRenaming]);

    useEffect(() => {
      if (isRenaming && inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    useEffect(() => {
      setNewName(item.data.caption);
    }, [item.data.caption]);

    const handleRename = () => {
      handleRenameItem(item.index, newName);
      setIsRenaming(false);
      context.stopRenaming();
    };

    return (
      <div>
        {context.isRenaming && isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRename();
              }
            }}
            autoFocus
          />
        ) : (
          <span>{item.data.caption}</span>
        )}
      </div>
    );
  };

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
          onDrop={onItemsDropped}
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
          // renderItemTitle={renderItemTitle}
          renderItemArrow={({ item, context }) => {
            // console.log(item);
            return item.children && item.children.length > 0 ? (
              <span {...context.arrowProps}>
                {context.isExpanded ? (
                  <i className="fa-regular fa-folder tree-item-arrow"></i>
                ) : (
                  <i className="fa-regular fa-folder-closed tree-item-arrow"></i>
                )}
              </span>
            ) : (
              <i className="fa-regular fa-file tree-item-arrow"></i>
            );
          }}
          renderItem={({ title, arrow, depth, context, children: item }) => {
            console.log(context);
            return (
              <li
                {...context.itemContainerWithChildrenProps}
                className="tree-item-container"
              >
                <button
                  {...context.itemContainerWithoutChildrenProps}
                  {...context.interactiveElementProps}
                  className={
                    context.isSelected
                      ? "tree-item tree-item-focused"
                      : "tree-item"
                  }
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

({ context, info, item, title }) => {
  // console.log(context);
  // return info.isRenaming ? (
  //   <input type="text" value={title} {...context} />
  // ) : (
  //   <p>{title}</p>
  // );
};
