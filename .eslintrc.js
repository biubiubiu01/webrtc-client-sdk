const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true,
  },
  plugins: ["vue"],
  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    allowImportExportEverywhere: true,
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    "eslint-config-airbnb-base",
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "plugin:vue/vue3-recommended",
    "plugin:vue/vue3-strongly-recommended",
    ".eslintrc-auto-import.json", // 解决 Eslint 提示 no-undef 错误
    "prettier",
    "plugin:prettier/recommended",
  ],
  /**
   * 规则说明：off 或 0 - 关闭规则；warn 或 1 - 打开规则作为警告（不影响退出代码）；error 或 2 - 打开规则作为错误（退出代码将为 1）
   */
  rules: {
    "vue/no-mutating-props": 0,
    // 不使用制表符
    "prettier/prettier": 2,
    semi: [2, "always"],
    quotes: [2, "double"],
    // 关闭默认参数应为最后一个
    "default-param-last": 0,
    "no-unused-vars": 1,
    // 关闭组件命名规则
    "vue/multi-word-component-names": 0,
    // 禁止使用多余的包
    "import/no-extraneous-dependencies": 0,
    // 确保在导入路径内一致使用文件扩展名
    "import/extensions": 0,
    // 确保导入指向可以解析的文件/模块
    "import/no-unresolved": 0,
    // 首选默认导出导入/首选默认导出
    "import/prefer-default-export": 0,
    // 要求使用 let 或 const 而不是 var
    "no-var": 2,
    // 禁止使用 new 以避免产生副作用
    "no-new": 1,
    // 禁止变量声明与外层作用域的变量同名
    "no-shadow": 0,
    // 禁用 console
    "no-console": 0,
    // 禁止标识符中有悬空下划线
    "no-underscore-dangle": 0,
    // 禁止在可能与比较操作符相混淆的地方使用箭头函数
    "no-confusing-arrow": 0,
    // 禁用一元操作符 ++ 和 --
    "no-plusplus": 0,
    // 禁止对 function 的参数进行重新赋值
    "no-param-reassign": 0,
    // 禁用特定的语法
    "no-restricted-syntax": 0,
    // 禁止在变量定义之前使用它们
    "no-use-before-define": 0,
    // 禁止直接调用 Object.prototypes 的内置属性
    "no-prototype-builtins": 0,
    // 禁止可以在有更简单的可替代的表达式时使用三元操作符
    "no-unneeded-ternary": 2,
    // 禁止重复模块导入
    "no-duplicate-imports": 2,
    // 禁止在对象中使用不必要的计算属性
    "no-useless-computed-key": 2,
    // 禁止不必要的转义字符
    "no-useless-escape": 0,
    // 禁用 continue 语句
    "no-continue": 0,
    // 强制使用一致的缩进
    indent: [2, 2, { SwitchCase: 1 }],
    // 强制使用骆驼拼写法命名约定
    camelcase: 0,
    // 强制类方法使用 this
    "class-methods-use-this": 0,
    // 要求构造函数首字母大写
    "new-cap": 2,
    // 强制一致地使用 function 声明或表达式
    "func-style": 0,
    // 强制一行的最大长度
    "max-len": 0,
    // 要求 return 语句要么总是指定返回的值，要么不指定
    "consistent-return": 0,
    // 强制switch要有default分支
    "default-case": 2,
    // 强制剩余和扩展运算符及其表达式之间有空格
    "rest-spread-spacing": 2,
    // 要求使用 const 声明那些声明后不再被修改的变量
    "prefer-const": 2,
    // 强制箭头函数的箭头前后使用一致的空格
    "arrow-spacing": 2,
    // 只强制对象解构，不强制数组解构
    "prefer-destructuring": [2, { object: true, array: false }],
    "no-unused-expressions": 0,
    "prefer-rest-params": 0,
    "func-names": 0,
    "array-callback-return": 0,
    radix: 0,
  },
});
