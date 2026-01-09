# Promise all/allSettle/any/race 的使用场景

- Promise.all

```javascript
/\*\*  
\* 全部任务执行 “成功” 后，进入 then 逻辑  
\* 返回所有任务的 "结果"  
\* 只要一个任务失败，进入 catch 逻辑  
\*/  
Promise.all(\[  
Promise.resolve('p1'),  
Promise.resolve('p2'),  
Promise.resolve('p3'),  
\]).then(results => {  
console.log('success', results);  
}).catch(error => {  
console.error('error', error);  
});

```

```javascript
/\*\*  
\* 场景：并发请求多个任务 且 不容忍失败  
\*/  
  
// 场景1：首页多板块渲染数据请求  
Promise.all(\[  
// 板块A 请求接口 api-1  
// 板块B 请求接口 api-2  
// 板块C 请求接口 api-3  
\]).then(results => {  
render('pannelA', results\[0\]);  
render('pannelB', results\[1\]);  
render('pannelC', results\[2\]);  
}).catch(error => {  
console.error('error', error);  
});

```
- Promise.allSettled

- Promise.any

- Promise.race

```javascript
/\*\*  
\* 场景特性：  
\* 需要获取最快返回的结果，不关心其他任务。  
\*/  
  
// 场景1：请求超时控制  
async function selfFetch(api, { timeout }) {  
return Promise.race(\[  
new Promise(resolve => {  
setTimeout(() => {  
resolve('fetch success');  
}, 500);  
}),  
new Promise((resolve, reject) => {  
setTimeout(() => {  
reject('request timeout');  
}, timeout);  
}),  
\])  
}  
  
selfFetch('/api', {  
timeout: 300  
}).then(result => {  
console.log('success', result);  
}).catch(error => {  
console.error('fail', error);  
}

```
