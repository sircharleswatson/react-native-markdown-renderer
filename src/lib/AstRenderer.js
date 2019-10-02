import React, { Component, PropTypes } from "react";
import { Text, View } from "react-native";
import getUniqueID from "./util/getUniqueID";

export function rootRenderRule(children, styles) {
  return <View key={getUniqueID()} style={styles.root}>{children}</View>;
}

/**
 *
 */
export default class AstRenderer {
  /**
   *
   * @param {Object.<string, function>} renderRules
   * @param {any} style
   */
  constructor(renderRules, style) {
    this._renderRules = renderRules;
    this._style = style;
  }

  /**
   *
   * @param {string} type
   * @return {string}
   */
  getRenderFunction = type => {
    let renderFunction;
    let allowedTypes = [
      "text",
      "textgroup",
      "strong",
      "em",
      "paragraph",
      "blockquote",
      "softbreak",
      "hardbreak",
      "s",
      "root",
      "view",
    ]

    if (allowedTypes.includes(type)) {
      renderFunction = this._renderRules[type];
    } else {
      renderFunction = this._renderRules["text"]
    }

    if (!renderFunction) {
      throw new Error(
        `${type} renderRule not defined example: <Markdown rules={renderRules}>`
      );
    }
    return renderFunction;
  };

  /**
   *
   * @param node
   * @param parentNodes
   * @return {*}
   */
  renderNode = (node, parentNodes) => {
    const renderFunction = this.getRenderFunction(node.type);

    const parents = [...parentNodes];
    parents.unshift(node);

    if (node.type === "text") {
      return renderFunction(node, [], parentNodes, this._style);
    }

    const children = node.children.map(value => {
      return this.renderNode(value, parents);
    });

    return renderFunction(node, children, parentNodes, this._style);
  };

  /**
   *
   * @param nodes
   * @return {*}
   */
  render = nodes => {
    const children = nodes.map(value => this.renderNode(value, []));
    return rootRenderRule(children, this._style);
  };
}
