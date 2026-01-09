# 迭代器模式 （ Iterator Pattern）

提供一种顺序访问聚合对象元素的方法，而无需暴露聚合对象的底层表示。

```javascript
// 抽象迭代器：迭代器  
class Iterator {  
constructor(collection) {  
this.collection = collection;  
this.index = 0;  
}  
  
hasNext() {  
return this.index < this.collection.length;  
}  
  
next() {  
if (this.hasNext()) {  
return this.collection\[this.index++\];  
}  
return null;  
}  
}  
  
// 具体迭代器：数组迭代器  
class ArrayIterator extends Iterator {  
constructor(collection) {  
super(collection);  
}  
}  
  
// 聚合类：集合  
class Collection {  
constructor() {  
this.items = \[\];  
}  
  
addItem(item) {  
this.items.push(item);  
}  
  
getIterator() {  
return new ArrayIterator(this.items);  
}  
}  
  
// 使用迭代器模式  
const collection = new Collection();  
collection.addItem("Item 1");  
collection.addItem("Item 2");  
collection.addItem("Item 3");  
  
const iterator = collection.getIterator();  
  
console.log("Iterating through the collection:");  
while (iterator.hasNext()) {  
console.log(iterator.next());  
}

```
