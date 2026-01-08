# vue3 中 ref 和 reactive 的区别

- **ref** 生成响应式对象，一般用于基础类型
- **源码地址：** /vue3/packages/reactivity/src/ref.ts

```javascript
function createRef(rawValue: unknown, shallow: boolean) {  
if (isRef(rawValue)) {  
return rawValue  
}  
return new RefImpl(rawValue, shallow)  
}  
  
class RefImpl<T> {  
private \_value: T  
private \_rawValue: T  
  
public dep?: Dep = undefined  
public readonly \_\_v\_isRef = true  
  
constructor(value: T, public readonly \_\_v\_isShallow: boolean) {  
this.\_rawValue = \_\_v\_isShallow ? value : toRaw(value)  
this.\_value = \_\_v\_isShallow ? value : toReactive(value)  
}  
  
get value() {  
trackRefValue(this)  
return this.\_value  
}  
  
set value(newVal) {  
const useDirectValue =  
this.\_\_v\_isShallow || isShallow(newVal) || isReadonly(newVal)  
newVal = useDirectValue ? newVal : toRaw(newVal)  
if (hasChanged(newVal, this.\_rawValue)) {  
this.\_rawValue = newVal  
this.\_value = useDirectValue ? newVal : toReactive(newVal)  
triggerRefValue(this, newVal)  
}  
}  
}

```
- **reactive** 代理整个对象，一般用于引用类型
- **源码地址：** /vue3/packages/reactivity/src/reactive.ts

```javascript
function createReactiveObject(  
target: Target,  
isReadonly: boolean,  
baseHandlers: ProxyHandler<any>,  
collectionHandlers: ProxyHandler<any>,  
proxyMap: WeakMap<Target, any>  
) {  
if (!isObject(target)) {  
if (\_\_DEV\_\_) {  
console.warn(\`value cannot be made reactive: ${String(target)}\`)  
}  
return target  
}  
// target is already a Proxy, return it.  
// exception: calling readonly() on a reactive object  
if (  
target\[ReactiveFlags.RAW\] &&  
!(isReadonly && target\[ReactiveFlags.IS\_REACTIVE\])  
) {  
return target  
}  
// target already has corresponding Proxy  
const existingProxy = proxyMap.get(target)  
if (existingProxy) {  
return existingProxy  
}  
// only specific value types can be observed.  
const targetType = getTargetType(target)  
if (targetType === TargetType.INVALID) {  
return target  
}  
const proxy = new Proxy(  
target,  
targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers  
)  
proxyMap.set(target, proxy)  
return proxy  
}

```
