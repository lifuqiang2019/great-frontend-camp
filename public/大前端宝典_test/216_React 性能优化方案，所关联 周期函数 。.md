# React 性能优化方案，所关联 周期函数 。

1.  使用PureComponent或shouldComponentUpdate方法来避免不必要的重新渲染。可确定是否需要重新渲染。
2.  使用React.memo()来缓存组件，避免不必要的重新渲染。React.memo()可以将组件的输入和输出缓存起来，避免相同的输入导致相同的输出。
3.  使用React.lazy()和Suspense来延迟加载组件。可降低初始加载时间，并提高应用程序的性能。
4.  使用shouldComponentUpdate或React.memo()来避免不必要的props更新，避免不必要的重新渲染。
5.  使用React.useCallback()和React.useMemo()来缓存函数和计算结果，避免不必要的函数调用和计算。
6.  使用React.Fragment来避免不必要的 DOM 节点。可减少DOM节点数量，提高应用程序的性能。

**shouldComponentUpdate**方法和**React.memo()** 与 React 性能优化的关联性较大。

- shouldComponentUpdate方法可以帮助您确定是否需要重新渲染组件，从而避免不必要的渲染。
- React.memo()可以将组件的输入和输出缓存起来，避免相同的输入导致相同输出，从而避免不必要的重新渲染。
