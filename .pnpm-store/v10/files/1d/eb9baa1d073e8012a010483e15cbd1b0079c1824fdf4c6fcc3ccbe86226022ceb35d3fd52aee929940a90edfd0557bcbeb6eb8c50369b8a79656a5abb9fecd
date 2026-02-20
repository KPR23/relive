// src/iconify.ts
import React from "react";
import "iconify-icon";
import {
  iconLoaded,
  getIcon,
  listIcons,
  addIcon,
  addCollection,
  calculateSize,
  buildIcon,
  loadIcons,
  loadIcon,
  addAPIProvider,
  setCustomIconLoader,
  setCustomIconsLoader,
  appendCustomStyle,
  _api
} from "iconify-icon";
var Icon = React.forwardRef(
  (props, ref) => {
    const newProps = {
      ...props,
      ref
    };
    if (typeof props.icon === "object") {
      newProps.icon = JSON.stringify(props.icon);
    }
    if (!props.inline) {
      delete newProps.inline;
    }
    if (props.className) {
      newProps["class"] = props.className;
    }
    return React.createElement("iconify-icon", newProps);
  }
);
export {
  Icon,
  _api,
  addAPIProvider,
  addCollection,
  addIcon,
  appendCustomStyle,
  buildIcon,
  calculateSize,
  getIcon,
  iconLoaded,
  listIcons,
  loadIcon,
  loadIcons,
  setCustomIconLoader,
  setCustomIconsLoader
};
