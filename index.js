export default function ({types: t}) {
  return {
      visitor: { 
          JSXElement: function (path) { 
              let { node } = path; 
              let ifAttr = node.openingElement.attributes
                  .find(({type, name}) => type === 'JSXAttribute' && name.name === 'r-if');
              if (ifAttr == null) { 
                  return;
              }

              let jsxOpeningElement = t.JSXOpeningElement( 
                  node.openingElement.name,
                  node.openingElement.attributes
                      ? node.openingElement.attributes.filter((attr)=> attr !== ifAttr)
                      : null
              );
              let jsxElement = t.JSXElement(
                  jsxOpeningElement,
                  node.closingElement,
                  node.children
              );
              let expression = t.conditionalExpression(
                  ifAttr.value.expression, 
                  jsxElement,
                  t.nullLiteral() 
              );
              path.replaceWith(expression);
          },
      }
  }
}
