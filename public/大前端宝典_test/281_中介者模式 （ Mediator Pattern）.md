# 中介者模式 （ Mediator Pattern）

用一个中介对象来封装一系列对象之间的交互，降低对象之间的 耦合性 。

```javascript
// 中介者类：聊天室  
class ChatRoom {  
constructor() {  
this.users = \[\];  
}  
  
addUser(user) {  
this.users.push(user);  
}  
  
sendMessage(message, sender) {  
for (const user of this.users) {  
if (user !== sender) {  
user.receiveMessage(message);  
}  
}  
}  
}  
  
// 参与者类：用户  
class User {  
constructor(name, chatRoom) {  
this.name = name;  
this.chatRoom = chatRoom;  
this.chatRoom.addUser(this);  
}  
  
send(message) {  
console.log(this.name + " sends: " + message);  
this.chatRoom.sendMessage(message, this);  
}  
  
receiveMessage(message) {  
console.log(this.name + " receives: " + message);  
}  
}  
  
// 使用中介者模式  
const chatRoom = new ChatRoom();  
  
const user1 = new User("Alice", chatRoom);  
const user2 = new User("Bob", chatRoom);  
const user3 = new User("Charlie", chatRoom);  
  
user1.send("Hello, Bob!");  
user2.send("Hi, Alice!");  
user3.send("Hey, everyone!");  
  
// 输出:  
// Alice sends: Hello, Bob!  
// Bob receives: Hello, Bob!  
// Charlie receives: Hello, Bob!  
// Bob sends: Hi, Alice!  
// Alice receives: Hi, Alice!  
// Charlie receives: Hi, Alice!  
// Charlie sends: Hey, everyone!  
// Alice receives: Hey, everyone!  
// Bob receives: Hey, everyone!

```
