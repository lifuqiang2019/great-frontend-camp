# Vue 的 $nextTick 是如何实现的

- 当调用 this.$nextTick(callback) 时，会将 callback 函数存储在一个队列中，以便稍后执行。
- 检查当前是否正在进行 DOM 更新周期。如果是，它会将 callback 函数推到一个专门用于在更新周期结束后执行的队列中。
- 如果当前不在 DOM 更新周期中，Vue.js 会使用 JavaScript 的 Promise 或者 MutationObserver ，具体取决于浏览器的支持情况，来创建一个微任务（microtask）。
- 微任务是 JavaScript 引擎在 执行栈 清空后立即执行的任务。因此， callback 函数会在下一个微任务中被执行，这就确保了它在下一次 DOM 更新周期之前执行。
- 一旦当前的 执行栈 清空， JavaScript 引擎就会检查并执行微任务队列中的任务，其中包括 $nextTick 的 回调函数 。

```javascript
/\* globals MutationObserver \*/  
  
import { noop } from 'shared/util'  
import { handleError } from './error'  
import { isIE, isIOS, isNative } from './env'  
  
export let isUsingMicroTask = false  
  
const callbacks: Array<Function> = \[\]  
let pending = false  
  
function flushCallbacks() {  
pending = false  
const copies = callbacks.slice(0)  
callbacks.length = 0  
for (let i = 0; i < copies.length; i++) {  
copies\[i\]()  
}  
}  
  
// Here we have async deferring wrappers using microtasks.  
// In 2.5 we used (macro) tasks (in combination with microtasks).  
// However, it has subtle problems when state is changed right before repaint  
// (e.g. #6813, out-in transitions).  
// Also, using (macro) tasks in event handler would cause some weird behaviors  
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).  
// So we now use microtasks everywhere, again.  
// A major drawback of this tradeoff is that there are some scenarios  
// where microtasks have too high a priority and fire in between supposedly  
// sequential events (e.g. #4521, #6690, which have workarounds)  
// or even between bubbling of the same event (#6566).  
let timerFunc  
  
// The nextTick behavior leverages the microtask queue, which can be accessed  
// via either native Promise.then or MutationObserver.  
// MutationObserver has wider support, however it is seriously bugged in  
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It  
// completely stops working after triggering a few times... so, if native  
// Promise is available, we will use it:  
/\* istanbul ignore next, $flow-disable-line \*/  
if (typeof Promise !== 'undefined' && isNative(Promise)) {  
const p = Promise.resolve()  
timerFunc = () => {  
p.then(flushCallbacks)  
// In problematic UIWebViews, Promise.then doesn't completely break, but  
// it can get stuck in a weird state where callbacks are pushed into the  
// microtask queue but the queue isn't being flushed, until the browser  
// needs to do some other work, e.g. handle a timer. Therefore we can  
// "force" the microtask queue to be flushed by adding an empty timer.  
if (isIOS) setTimeout(noop)  
}  
isUsingMicroTask = true  
} else if (  
!isIE &&  
typeof MutationObserver !== 'undefined' &&  
(isNative(MutationObserver) ||  
// PhantomJS and iOS 7.x  
MutationObserver.toString() === '\[object MutationObserverConstructor\]')  
) {  
// Use MutationObserver where native Promise is not available,  
// e.g. PhantomJS, iOS7, Android 4.4  
// (#6466 MutationObserver is unreliable in IE11)  
let counter = 1  
const observer = new MutationObserver(flushCallbacks)  
const textNode = document.createTextNode(String(counter))  
observer.observe(textNode, {  
characterData: true  
})  
timerFunc = () => {  
counter = (counter + 1) % 2  
textNode.data = String(counter)  
}  
isUsingMicroTask = true  
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {  
// Fallback to setImmediate.  
// Technically it leverages the (macro) task queue,  
// but it is still a better choice than setTimeout.  
timerFunc = () => {  
setImmediate(flushCallbacks)  
}  
} else {  
// Fallback to setTimeout.  
timerFunc = () => {  
setTimeout(flushCallbacks, 0)  
}  
}  
  
export function nextTick(): Promise<void>  
export function nextTick<T>(this: T, cb: (this: T, ...args: any\[\]) => any): void  
export function nextTick<T>(cb: (this: T, ...args: any\[\]) => any, ctx: T): void  
/\*\*  
\* @internal  
\*/  
export function nextTick(cb?: (...args: any\[\]) => any, ctx?: object) {  
let \_resolve  
callbacks.push(() => {  
if (cb) {  
try {  
cb.call(ctx)  
} catch (e: any) {  
handleError(e, ctx, 'nextTick')  
}  
} else if (\_resolve) {  
\_resolve(ctx)  
}  
})  
if (!pending) {  
pending = true  
timerFunc()  
}  
// $flow-disable-line  
if (!cb && typeof Promise !== 'undefined') {  
return new Promise(resolve => {  
\_resolve = resolve  
})  
}  
}

```
