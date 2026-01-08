# JS 数组 reduce 方法的使用

```javascript
// 累加  
const result = \[1,2,3\].reduce((pre, cur) => return{pre + cur},0);  
console.log(result);  
  
// 找最大值  
const result = \[1,2,3,2,1\].reduce((pre, cur) => Math.max(pre, cur));  
console.log(result);  
  
// 数组去重  
const resultList = \[1,2,3,2,1\].reduce((preList, cur) => {  
if (preList.indexOf(cur) === -1) {  
preList.push(cur);  
}  
return preList;  
}, \[\]);  
console.log(resultList);  
  
// 归类  
const dataList = \[{  
name: 'aa',  
country: 'China'  
}, {  
name: 'bb',  
country: 'China'  
}, {  
name: 'cc',  
country: 'USA'  
}, {  
name: 'dd',  
country: 'EN'  
}\];  
const resultObj = dataList.reduce((preObj, cur) => {  
const { country } = cur;  
if (!preObj\[country\]) {  
preObj\[country\] = \[\];  
}  
preObj\[country\].push(cur);  
return preObj;  
}, {});  
console.log(resultObj);  
  
// 字符串反转  
const str = 'hello world';  
const resultStr = Array.from(str).reduce((pre, cur) => {  
return \`${cur}${pre}\`;  
}, '');  
console.log(resultStr);

```
