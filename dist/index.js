'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (_ref) {
    var t = _ref.types;

    return {
        visitor: {
            JSXElement: function JSXElement(path) {
                var node = path.node;

                var ifAttr = node.openingElement.attributes.find(function (_ref2) {
                    var type = _ref2.type,
                        name = _ref2.name;
                    return type === 'JSXAttribute' && name.name === 'r-if';
                });
                if (ifAttr == null) {
                    return;
                }

                var jsxOpeningElement = t.JSXOpeningElement(node.openingElement.name, node.openingElement.attributes ? node.openingElement.attributes.filter(function (attr) {
                    return attr !== ifAttr;
                }) : null);
                var jsxElement = t.JSXElement(jsxOpeningElement, node.closingElement, node.children);
                var expression = t.conditionalExpression(ifAttr.value.expression, jsxElement, t.nullLiteral());
                path.replaceWith(expression);
            }
        }
    };
};