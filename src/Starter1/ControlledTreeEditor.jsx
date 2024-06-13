import React, { useEffect, useState, useRef } from "react";
import { Tree, ControlledTreeEnvironment } from "react-complex-tree";
import { validateLines, buildTreeData } from "../TextParser";
import AppLock from "../AppLock";
import SelectUser from "../Login/SelectUser";
import Save from "../Save";
import "react-complex-tree/lib/style-modern.css";
import "./styles.css";

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

  return (
    <React.Fragment>
      {error && <ErrorMessage error={error} />}
      {!items && !error && <div>Loading...</div>}
      {items && !error && (
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
              // console.log(context);
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
      )}
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

function ErrorMessage({ error }) {
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

({ context, info, item, title }) => {
  // console.log(context);
  // return info.isRenaming ? (
  //   <input type="text" value={title} {...context} />
  // ) : (
  //   <p>{title}</p>
  // );
};
