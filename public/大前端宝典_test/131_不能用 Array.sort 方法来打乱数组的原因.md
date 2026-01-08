# 不能用 Array.sort 方法来打乱数组的原因

用 sort 会导致算法不稳定，在这极端下，数组不会被打乱，参考下面代码，会有 50% 概率数组原封不动。

```javascript
const arr = \[1, 2\]  
arr.sort((a, b) => Math.random() > 0.5 ? 1 : -1);  
console.log(arr); // 50% 打乱

```
