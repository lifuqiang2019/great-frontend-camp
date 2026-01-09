# dependencies 和 devDependencies 两者区别

**dependencies：**

- 属性用于定义项目的运行时依赖，这些包在实际部署和运行项目时是必需的，会被安装在生产环境。
- 这些依赖通常包括项目的核心功能所需的包，如Web框架、数据库驱动、工具库等。
- 当使用 npm install 或 yarn add 命令时，这些依赖包将被安装。

```json
"dependencies": {  
"koa": "2.7.0",  
"vue": "^3.3.4"  
}

```
**devDependencies：**

- 属性用于定义项目的开发依赖，这些依赖包在开发过程中是必需的，但在实际生产环境中不需要。
- 这些依赖通常包括开发工具、测试框架、代码检查工具、打包工具等，用于项目的构建和开发。
- 当使用 npm install --save-dev 或 yarn add --dev 命令时，这些依赖包将被安装。

```json
"devDependencies": {  
"babel-cli": "^6.26.0",  
"mocha": "^9.0.0",  
"eslint": "^7.28.0"  
}

```
