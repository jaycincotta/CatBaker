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

const validateLines = (lines) => {
  if (lines.length === 0) return null;

  let previousDepth = -1;
  for (let i = 0; i < lines.length; i++) {
    const parsedLine = parse(lines[i]);
    if (i === 0 && parsedLine.depth !== 0) {
      return {
        lineNumber: i + 1,
        message: "The first category may not be nested.",
        lineText: lines[i],
      };
    }
    if (parsedLine.depth > previousDepth + 1) {
      return {
        lineNumber: i + 1,
        message: "Category is too deeply nested",
        lineText: lines[i],
      };
    }
    previousDepth = parsedLine.depth;
  }

  return null;
};

function getDepth(str) {
  const match = str.match(/^[-]+/); // Match one or more dashes at the beginning of the string
  return match ? match[0].length : 0;
}

const buildTreeData = (lines) => {
  const root = { index: "root", isFolder: true, children: [] };
  const items = { root };
  const parentsStack = [root];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const depth = getDepth(line);
    let rootParent = "root";

    if (depth > 0) {
      for (let i = index; i > -1; i--) {
        const prev = lines[i];
        if (getDepth(prev) === 0) {
          rootParent = prev;
          break;
        }
      }
    }

    const parsedLine = parse(line);
    const newItem = {
      index: `item-${index}`,
      id: parsedLine.caption,
      textId: `${rootParent}|${line}`,
      data: {
        caption: parsedLine.caption,
        dataId: parsedLine.dataId,
      },
      isFolder: true,
      children: [],
    };

    while (parentsStack.length > parsedLine.depth + 1) {
      parentsStack.pop();
    }

    const currentParent = parentsStack[parentsStack.length - 1];
    currentParent.children.push(newItem.index);
    currentParent.isFolder = true;

    items[newItem.index] = newItem;

    if (parsedLine.depth >= parentsStack.length) {
      parentsStack.push(newItem);
    } else {
      parentsStack[parsedLine.depth + 1] = newItem;
    }
  }

  // lines.forEach((line, index) => {
  //   const parsedLine = parse(line);
  //   const newItem = {
  //     index: `item-${index}`,
  //     id: parsedLine.caption,
  //     textId: line,
  //     data: {
  //       caption: parsedLine.caption,
  //       dataId: parsedLine.dataId,
  //     },
  //     isFolder: true,
  //     children: [],
  //   };

  //   while (parentsStack.length > parsedLine.depth + 1) {
  //     parentsStack.pop();
  //   }

  //   const currentParent = parentsStack[parentsStack.length - 1];
  //   currentParent.children.push(newItem.index);
  //   currentParent.isFolder = true;

  //   items[newItem.index] = newItem;

  //   if (parsedLine.depth >= parentsStack.length) {
  //     parentsStack.push(newItem);
  //   } else {
  //     parentsStack[parsedLine.depth + 1] = newItem;
  //   }
  // });

  return items;
};

export { parse, validateLines, buildTreeData };
