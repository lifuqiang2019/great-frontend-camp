# Margin 塌陷与 BFC 详解

## 1. Margin 塌陷（外边距合并）

在 CSS 中，两个垂直相邻的块级元素，它们的上下 `margin` 会发生合并（Collapse），取两者中较大的那个值作为实际间距，而不是相加。

**示例场景**：
*   上方元素 `margin-bottom: 200px`
*   下方元素 `margin-top: 100px`
*   **结果**：间距为 `200px`（取最大值），而非 `300px`。

**解决方案**：
触发 BFC（块级格式化上下文）可以阻止外边距合并。

## 2. BFC (Block Formatting Context)

**定义**：
BFC 是 Web 页面中一个独立的渲染区域。BFC 内部的元素布局与外部互不影响。可以把它看作一个封闭的箱子。

**BFC 的特性**：
1.  BFC 内部的 Box 会垂直排列。
2.  BFC 区域不会与浮动元素（float）重叠（可用于实现两栏布局）。
3.  计算 BFC 的高度时，浮动元素也参与计算（可用于清除浮动）。
4.  **BFC 也就是一个独立的容器，容器内的元素不会影响容器外的元素（解决了 Margin 塌陷）。**

## 3. 如何触发 BFC

只要满足以下任意一个条件，元素就会生成 BFC：

*   **`float`**：值不为 `none` (如 `left`, `right`)。
*   **`position`**：值为 `absolute` 或 `fixed`。
*   **`display`**：值为 `inline-block`, `table-cell`, `table-caption`, `flex`, `grid` 等。
*   **`overflow`**：值不为 `visible` (如 `hidden`, `auto`, `scroll`)。
