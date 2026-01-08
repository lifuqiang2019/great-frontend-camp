# 代理模式（Proxy Pattern）

为其他对象提供一个代理，以控制对这个对象的访问。

```javascript
// 抽象主题：图片加载器  
class ImageLoader {  
displayImage() {}  
}  
  
// 具体主题：真正的图片加载器  
class RealImageLoader extends ImageLoader {  
constructor(filename) {  
super();  
this.filename = filename;  
this.loadImage();  
}  
  
loadImage() {  
console.log(\`Loading image: ${this.filename}\`);  
}  
  
displayImage() {  
console.log(\`Displaying image: ${this.filename}\`);  
}  
}  
  
// 代理：图片加载代理  
class ImageLoaderProxy extends ImageLoader {  
constructor(filename) {  
super();  
this.filename = filename;  
this.realImageLoader = null;  
}  
  
displayImage() {  
if (!this.realImageLoader) {  
this.realImageLoader = new RealImageLoader(this.filename);  
}  
this.realImageLoader.displayImage();  
}  
}  
  
// 使用代理模式  
const image1 = new ImageLoaderProxy("image1.jpg");  
const image2 = new ImageLoaderProxy("image2.jpg");  
  
// 图片并不会立即加载，直到调用 displayImage 方法  
image1.displayImage();  
image2.displayImage();

```
**操作系统 题目**
