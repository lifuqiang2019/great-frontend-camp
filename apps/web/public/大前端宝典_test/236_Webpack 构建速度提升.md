# Webpack 构建速度提升

1.  **升级Webpack版本：** 使用最新版本的Webpack，因为每个新版本通常都会包含性能改进和优化。
2.  **使用持久缓存：** 配置Webpack以生成长期缓存的文件名，在构建时只有修改过的文件需要重新构建。
3.  **配置最小的 loader 规则：** 只使用必要的loader规则，避免不必要的文件处理，以减小构建时间。
4.  **使用HappyPack：** HappyPack是一个 多线程 Loader 处理工具，可以加速构建过程。
5.  **使用thread-loader：** 类似于HappyPack，thread-loader也可以将 loader 任务分发给多个线程。
6.  **使用 DLL （ 动态链接库 ）：** 将不经常更改的依赖库（如 React 、Vue等）打包为DLL，以减少构建时间。
7.  **使用缓存：** 配置Webpack的缓存，以避免在每次构建时重新加载依赖。
8.  **减少模块数量：** 优化项目，减少模块和依赖的数量，以减小构建时间。
9.  **Code Splitting：** 使用Webpack的代码分割功能，以减小每次构建需要处理的模块数量。
10.  **优化 loader ：** 选择高效的loader，或者编写自定义loader以提高处理速度。
11.  **优化插件：** 选择和配置插件，确保它们不会导致构建速度变慢。
12.  **使用 Tree Shaking：** 启用Webpack的Tree Shaking功能，以删除未使用的代码，减小包的大小。
13.  **使用resolve配置：** 通过Webpack的 resolve 配置来减小模块查找时间，提高构建速度。
14.  **开发模式和生产模式分离：** 确保区分开发和生产构建模式，以避免不必要的开发工具和代码优化。
15.  **使用Webpack Dev Server：** 可以提供热模块替换（ HMR ）和快速重构建。
16.  **分析工具：** 使用Webpack Bundle Analyzer等分析工具来识别和解决包大小过大的问题。
