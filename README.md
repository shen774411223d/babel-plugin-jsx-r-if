### jsx-r-if

- ##### 通过babel中AST来修改element
    - 现代框架（vue，react）渲染阶段：各种loader将vue/jsx文件转换为js文件 => babel接手将js文件转译成浏览器可识别代码 => webpack打包 => 浏览器运行（Vue/React将js代码抽象成VNODE（虚拟DOM））
      
    - 在上述阶段中我们可以从babel入手，在babel对代码转译时我们将具有r-if属性的组件全部遍历即可达到我们想要的效果
    ```
        // 使用
        import React, { FC, useState } from 'react'
        const App: FC = props => {
            const [status, setStatus] = useState<boolean>(false)
            return (
                <>
                    <button onClick={setStatus(!status)}>change status</button>
                    <div r-if={status}>
                        hello React!
                    </div>
                </>
            )
        }
    ```
    
    ```
        // .babelrc
        "babel": {
            "presets": [
              "react-app",
              "es2015"
            ],
            "plugins": [
              "jsx-r-if"
            ]
        }
    ```
    
    
    ```
        // babel部分 对外暴露了一个函数，接受参数types。
        export default function ({types: t}) {
            return {
                /* 
                功能：可在react中直接使用 v-if 不过现在叫 r-if 了
        
                    实现方式依托于babel。babel会将js文件转换成 AST抽象语法树（可以理解为把给人看的转换成给计算机看的）
                    我们只需要访问AST语法抽象树并对其遍历找出带 r-if 标签的组件对其修改就ok
                    再访问AST中我们最关注的就是 visitor。visitor是AST中的访问者，想访问哪种属性就定义在visitor下即可
                    JSXElement是AST抽象后对react的描述，JSXElement === jsx中的组件（或者html标签）
                    以下出现的变量均为AST中自带的方法及变量
                        
                */
                visitor: { // 在babel里称为访问者
                    JSXElement: function (path) { // JSXElement => jsx中的组件元素
                        let { node } = path; // path.node 可获取到该节点的AST
                        // 遍历 JSXElement 上所有的属性并找出带r-if的
                        let ifAttr = node.openingElement.attributes
                            .find(({type, name}) => type === 'JSXAttribute' && name.name === 'r-if');
                        if (ifAttr == null) { // 如果ifAttr为undefined则表示该组件没有r-if，则停止访问
                            return;
                        }
                        // 如果ifAttr不为undefined则表示该组件有r-if。下一步是创建新的组件替换之
        
                        /* 
                        给大家解释一下什么是起始标签 什么是结束标签
                        <div r-if="true"> 起始部位
                        </div> 结束部位
                        */
        
        
                        // t.JSXOpeningElement表示创建一个组件（或者html标签）的起始部位，参数分别为：标签的类型，属性
                        // 这里我创建了一个组件的起始部位，再将原有的属性赋给新的组件
                        let jsxOpeningElement = t.JSXOpeningElement( 
                            node.openingElement.name,
                            node.openingElement.attributes
                                ? node.openingElement.attributes.filter((attr)=> attr !== ifAttr)
                                : null
                        );
                        // t.JSXElement 表示创建一个react组件（或者html标签），参数分别为：开始标签，结束标签，子集
                        // 创建新的react组件，并讲上一步创建好的起始部位拿过来
                        let jsxElement = t.JSXElement(
                            jsxOpeningElement,
                            node.closingElement,
                            node.children
                        );
                        // t.conditionalExpression 创建一个三元表达式 ，参数分别为：条件，为真时执行，为假时执行
                        // 等于：expression = r-if === true? <div></div> : null
                        let expression = t.conditionalExpression(
                            ifAttr.value.expression, // r-if=“true” 
                            jsxElement, // 创建好的react组件
                            t.nullLiteral() // 这个方法会返回一个 null
                        );
                        //  replaceWith 方法为替换方法
                        path.replaceWith(expression);
                    },
                }
            }
        }
    ```
    
- 源码地址：[我的github](https://github.com/shen774411223d/book)
