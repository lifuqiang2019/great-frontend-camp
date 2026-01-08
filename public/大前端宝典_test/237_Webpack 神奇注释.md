# Webpack 神奇注释

Webpack的"神奇注释"（Magic Comments）是一种特殊的注释语法，用于在Webpack打包过程中提供附加的 指令 和配置信息。这些注释以特殊的格式编写，并可以影响Webpack的行为。

1.  **Chunk名称注释：** 用于动态导入的模块指定生成的Chunk文件的名称。

```javascript
import(/\* webpackChunkName: "my-chunk" \*/ './my-module');

1.  **Chunk模式注释：** 用于指定模块的加载模式，如"lazy"、"lazy-once"、"eager"等。

```

```javascript
import(/\* webpackMode: "lazy-once" \*/ './my-module');

1.  **Chunk预取注释：** 用于指定是否在空闲时预取模块。

```

```javascript
import(/\* webpackPrefetch: true \*/ './my-module');

1.  **Chunk 预加载 注释：** 用于指定是否在当前模块加载后立即预加载模块。

```

```javascript
import(/\* webpackPreload: true \*/ './my-module');

这些神奇注释可以在Webpack的动态导入中使用，以帮助控制Chunk的生成、加载模式和优化策略。

```
