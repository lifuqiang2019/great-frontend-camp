# webpack 常用 Loader

- **Babel Loader：** 用于将新版JavaScript（如ES6+）转换为旧版JavaScript，以确保在不同浏览器中的兼容性。解决了不同JavaScript版本之间的问题。
- **CSS Loader：** 处理CSS文件，使其能够被打包到应用程序中。可以配合其他Loader（如style-loader）一起使用，以处理CSS的导入、模块化等问题。
- **Style Loader：** 将CSS样式加载到页面中，通常与CSS Loader一起使用。
- **File Loader：**处理文件资源（如图片、字体等），将它们复制到输出目录，并返回文件路径。**URL Loader：** 与File Loader类似，但可以将小文件转换为Base64编码的Data URL，以减小HTTP请求的数量。
- **Sass/SCSS Loader：** 处理Sass或SCSS样式文件，将它们转换为CSS，以便在浏览器中使用。
- **Less Loader：** 处理Less样式文件，将它们转换为CSS。
- **PostCSS Loader：** 通过PostCSS插件对CSS进行转换，以实现自动前缀、代码压缩、变量替换等任务。
- **Image Loader：** 处理图片文件，包括压缩、优化和Base64编码等操作。
- **Vue Loader：** 用于加载和解析Vue.js单文件组件，包括模板、脚本和样式。
- **TypeScript Loader：** 将TypeScript代码转换为JavaScript，使其可以在浏览器中运行。
- **ESLint Loader：** 与ESLint集成，用于在构建过程中进行代码质量检查，查找潜在的问题并确保代码规范。
