import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Tree, ControlledTreeEnvironment } from "react-complex-tree";
import { validateLines, buildTreeData } from "../TextParser";
import ErrorMessage from "../ErrorMessage";
import "react-complex-tree/lib/style-modern.css";
import AppContext from "../Context/AppContext";
import "./styles.css";

const ControlledTreeEditor = forwardRef(
  ({ text, onChange, onItemSelection }, ref) => {
    const environmentRef = useRef();
    const [items, setItems] = useState();
    const [focusedItem, setFocusedItem] = useState();
    const [expandedItems, setExpandedItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [error, setError] = useState();
    const [cachedItems, setCachedItems] = useState();
    const { collapsedCount, setCollapsedCount } = useContext(AppContext);
    const containerRef = useRef();

    useImperativeHandle(ref, () => ({
      collapseExpand() {
        if (collapsedCount > 0) {
          setCollapsedCount(0);
          setExpandedItems(Object.keys(items));
        } else {
          const parentNodeCount = Object.values(items).filter((item) => {
            if (item.index === "root") return false;
            return !item.data.caption.startsWith("\n-");
          });
          setCollapsedCount(parentNodeCount.length);
          setExpandedItems([]);
        }
      },
      selectItem(textId) {
        if (!items) return;

        // find item w/ matching textid [parent|child]
        const item = Object.values(items).find((item) => {
          if (item.index === "root") return false;
          return item.textId === textId.trim();
        });

        if (!item) return;

        // select item on tree control
        setSelectedItems([item.index]);

        // scroll item into view
        const treeItemElement = document.querySelector(
          `[text-id="${item.textId}"]`,
        );

        if (treeItemElement) {
          treeItemElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      },
      setScrollTopPosition(position) {
        if (collapsedCount > 0) return;
        containerRef.current.scrollTop = position;
      },
      focusSelectedItem() {
        const focusedElement = document.querySelector(
          `[data-rct-item-id="${focusedItem}"]`,
        );
        focusedElement.focus();
      },
    }));

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
      setCachedItems(generatedData);
      setExpandedItems(Object.keys(generatedData));
    }, [text]);

    useEffect(() => {
      if (!items || !environmentRef?.current?.linearItems?.tree) return;
      if (JSON.stringify(items) === JSON.stringify(cachedItems)) return;
      buildItemsText(items);
    }, [items]);

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

    // The text-id also needs to be updated for the current item and any of it's children to enable renaming
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

    const handleOnSelectItems = (itemIndexes) => {
      setSelectedItems(itemIndexes);
      const item = items[itemIndexes[0]];
      onItemSelection(item.textId);
    };

    const Error = () => (
      <React.Fragment>
        Error on line: {error.lineNumber} "{error.lineText}"
        <br />
        {error.message}
      </React.Fragment>
    );

    return (
      <React.Fragment>
        {error && (
          <ErrorMessage>
            <Error />
          </ErrorMessage>
        )}
        {!items && !error && <div>Loading...</div>}
        {items && !error && (
          <div className="output-section" ref={containerRef}>
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
              onSelectItems={handleOnSelectItems}
              renderItemTitle={({ title }) => <p>{title}</p>}
              renderItemArrow={({ item, context }) => {
                return item.children && item.children.length > 0 ? (
                  <span {...context.arrowProps}>
                    {context.isExpanded ? (
                      <i className="fa-solid fa-minus tree-item-arrow"></i>
                    ) : (
                      <i className="fa-solid fa-plus tree-item-arrow"></i>
                    )}
                  </span>
                ) : (
                  <i className="fa-regular fa-chevron-right tree-item-arrow"></i>
                );
              }}
              renderItem={({
                title,
                arrow,
                depth,
                context,
                children: item,
              }) => {
                const treeItem = item.props
                  ? items[item.props.parentId]
                  : { id: "collapsed-item", index: "" };
                const InteractiveComponent = context.isRenaming
                  ? "div"
                  : "button";
                return (
                  <React.Fragment>
                    <li
                      {...context.itemContainerWithChildrenProps}
                      className="tree-item-container"
                      text-id={treeItem.textId}
                    >
                      <InteractiveComponent
                        {...context.itemContainerWithoutChildrenProps}
                        {...context.interactiveElementProps}
                        className={
                          context.isSelected
                            ? "tree-item tree-item-focused"
                            : "tree-item"
                        }
                        style={{ paddingLeft: depth * 20 + 10 + "px" }}
                      >
                        {arrow}
                        {title}
                      </InteractiveComponent>
                    </li>
                    {item}
                  </React.Fragment>
                );
              }}
            >
              <Tree treeId="tree" rootItem="root" treeLabel="Tree Editor" />
            </ControlledTreeEnvironment>
          </div>
        )}
      </React.Fragment>
    );
  },
);

export default ControlledTreeEditor;
