// This plugin will generate a sample codegen plugin
// that appears in the Element tab of the Inspect panel.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This provides the callback to generate the code.
figma.codegen.on('generate', async (event) => {
  const node: SceneNode = event.node;

  const currentNode  = figma.currentPage.selection[0];
  const { params, raw } = await paramsFromNode(currentNode);

  console.log("params", params);
  console.log("raw", raw);

  let textStrings: string[] = [];

  if ("findAll" in node) {
    textStrings = node.findAll((node) => node.type === "TEXT").map((node) => (node as TextNode).characters);
  }

  let jsonStringDictionary: {
    [key: string]: { string: string };
  } = {};

  for (const textString of textStrings) {
    const jsonKey = createJsonKey(textString);

    jsonStringDictionary[jsonKey] = { string: textString };
  }

  return [
    {
      language: "JSON",
      code: JSON.stringify(jsonStringDictionary, null, 2),
      title: "i18n-dict",
    },
  ];
});

// Function to create a JSON key from a string
function createJsonKey(inputString: string) {
  return inputString.toLowerCase().replace(/\s/g, "_");
}

async function paramsFromNode(node: BaseNode, propertiesOnly = false) {
  const valueObject = valueObjectFromNode(node);
  const object: any = {};
  const isDefinitions =
    valueObject[Object.keys(valueObject)[0]] &&
    "defaultValue" in valueObject[Object.keys(valueObject)[0]];
  const instanceProperties: any = {};
  for (let propertyName in valueObject) {
    const value = isDefinitions
      ? (valueObject as ComponentPropertyDefinitions)[propertyName].defaultValue
      : (valueObject as ComponentProperties)[propertyName].value;
    const type = valueObject[propertyName].type;
    //const cleanName = sanitizePropertyName(propertyName, type);
    const cleanName = sanitizePropertyName(propertyName);
    if (value !== undefined) {
      object[cleanName] = object[cleanName] || {};
      if (typeof value === "string") {
        if (type === "VARIANT") object[cleanName].VARIANT = value;
        if (type === "TEXT") object[cleanName].TEXT = value;
        if (type === "INSTANCE_SWAP") {
          const foundNode = await figma.getNodeById(value);
          const nodeName =
            foundNode &&
            foundNode.parent &&
            foundNode.parent.type === "COMPONENT_SET"
              ? foundNode.parent.name
              : (foundNode ? foundNode.name : '');
          object[cleanName].INSTANCE_SWAP = nodeName || "";
          if (foundNode)
            instanceProperties[cleanName] = await paramsFromNode(foundNode, true);
        }
      } else {
        object[cleanName].BOOLEAN = value;
      }
    }
  }

  const params: any = {};
  const raw: any = {};
  const initial = await initialParamsFromNode(node as FrameNode);
  for (let key in object) {
    const item = object[key];
    const itemKeys = Object.keys(item);
    if (itemKeys.length > 1) {
      itemKeys.forEach((type) => {
        const value = item[type].toString();
        params[`property.${key}.${type.charAt(0).toLowerCase()}`] =
          splitString(value);
        raw[`property.${key}.${type.charAt(0).toLowerCase()}`] = value;
      });
    } else {
      const value = item[itemKeys[0]].toString();
      params[`property.${key}`] = splitString(value);
      raw[`property.${key}`] = value;
    }
    if (itemKeys.includes("INSTANCE_SWAP") && instanceProperties[key]) {
      const keyPrefix =
        itemKeys.length > 1 ? `property.${key}.i` : `property.${key}`;
      for (let k in instanceProperties[key].params) {
        params[`${keyPrefix}.${k}`] = splitString(
          instanceProperties[key].params[k]
        );
        raw[`${keyPrefix}.${k}`] = instanceProperties[key].raw[k];
      }
    }
  }

  return propertiesOnly
    ? {
      params,
      raw,
    }
    : {
      params: Object.assign(params, initial.params),
      raw: Object.assign(raw, initial.raw),
    };
}

async function initialParamsFromNode(node: FrameNode) {
  const componentNode = getComponentNodeFromNode(node);
  if (!componentNode)
    console.error("Could not find component node for", node.name)

  const css = await node.getCSSAsync();
  const autolayout = node.inferredAutoLayout;
  const boundVariables = node.boundVariables;
  const raw: any = {
    "node.name": node.name,
    "node.type": node.type,
    // "node.key": node.key,
  };
  const params: any = {
    "node.name": splitString(node.name),
    "node.type": splitString(node.type),
    // "node.key": node.key,
  };
  if (componentNode && componentNode.key) {
    const _componentNode = componentNode as ComponentNode;

    raw["component.key"] = _componentNode.key;
    raw["component.type"] = _componentNode.type;
    raw["component.name"] = _componentNode.name;
    params["component.key"] = _componentNode.key;
    params["component.type"] = splitString(_componentNode.type);
    params["component.name"] = splitString(_componentNode.name);
  }
  for (let key in css) {
    const k = filterString(key, key, "camel");
    params[`css.${k}`] = css[key];
    raw[`css.${k}`] = css[key];
  }
  if (autolayout) {
    const props: (keyof typeof autolayout)[] = [
      "layoutMode",
      "layoutWrap",
      "paddingLeft",
      "paddingRight",
      "paddingTop",
      "paddingBottom",
      "itemSpacing",
      "counterAxisSpacing",
      "primaryAxisAlignItems",
      "counterAxisAlignItems",
    ];
    props.forEach((p) => {
      const val = autolayout[p] + "";
      if (val !== "undefined" && val !== "null") {
        raw[`autolayout.${p}`] = val;
        params[`autolayout.${p}`] = splitString(val);
      }
    });
  }
  return { params, raw };
}

function valueObjectFromNode(node: BaseNode) {
  if (node.type === "INSTANCE") return node.componentProperties;
  if (node.type === "COMPONENT_SET") return node.componentPropertyDefinitions;
  if (node.type === "COMPONENT") {
    if (node.parent && node.parent.type === "COMPONENT_SET") {
      const initialProps = Object.assign(
        {},
        node.parent.componentPropertyDefinitions
      );
      const nameProps = node.name.split(", ");
      nameProps.forEach((prop) => {
        const [propName, propValue] = prop.split("=");
        initialProps[propName].defaultValue = propValue;
      });
      return initialProps;
    } else {
      return node.componentPropertyDefinitions;
    }
  }
  return {};
}

function splitString(string = "") {
  string = string.replace(/([^a-zA-Z0-9-_// ])/g, "");
  if (!string.match(/^[A-Z0-9_]+$/)) {
    string = string.replace(/([A-Z])/g, " $1");
  }
  return string
    .replace(/([a-z])([0-9])/g, "$1 $2")
    .replace(/([-_/])/g, " ")
    .replace(/  +/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .join("-");
}

function getComponentNodeFromNode(node: SceneNode): ComponentNode | ComponentSetNode | null {
  const { type, parent } = node;
  const parentType = parent ? parent.type : "";
  const isVariant = parentType === "COMPONENT_SET";
  if (type === "COMPONENT_SET" || (type === "COMPONENT" && !isVariant)) {
    return node;
  } else if (type === "COMPONENT" && isVariant) {
    return parent as ComponentNode;
  } else if (type === "INSTANCE") {
    const { mainComponent } = node;

    if (mainComponent && mainComponent.parent)
      return mainComponent.parent.type === "COMPONENT_SET"
        ? mainComponent.parent
        : mainComponent;
  }
  return null
}

function downcase(name: string) {
  return `${name.charAt(0).toLowerCase()}${name.slice(1)}`;
}

function numericGuard(name = "") {
  if (name.charAt(0).match(/\d/)) {
    name = `N${name}`;
  }
  return name;
}

function capitalize(name: string) {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

function capitalizedNameFromName(name = "") {
  name = numericGuard(name);
  return name
    .split(/[^a-zA-Z\d]+/g)
    .map(capitalize)
    .join("");
}

function sanitizePropertyName(name: string) {
  name = name.replace(/#[^#]+$/g, "");
  return downcase(capitalizedNameFromName(name).replace(/^\d+/g, ""));
}

function filterString(string: string, rawString: string, filter: string) {
  if (!filter) filter = "hyphen";
  const strings = string.split("-");
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.substring(1);
  switch (filter) {
    case "camel":
      return strings
        .map((word, i) => (i === 0 ? word : capitalize(word)))
        .join("");
    case "constant":
      return strings.join("_").toUpperCase();
    case "hyphen":
      return strings.join("-").toLowerCase();
    case "pascal":
      return strings.map(capitalize).join("");
    case "raw":
      return rawString;
    case "snake":
      return strings.join("_").toLowerCase();
  }
  return strings.join(" ");
}
