# Function Calling 与 MCP 实现差异

**Function Calling 版本**

_模型调用 getStockPrice('AAPL') 获取苹果股价：_

```javascript
// 模型 → JSON → 你手动调用 API → 返回结果 → 再交给模型。  
functions: \[{  
name: "getStockPrice",  
parameters: { type: "object", properties: { symbol: { type: "string" } } }  
}\]

```
**MCP 版本**

_模型通过 MCP 直接访问股票工具服务：_

```json
// MCP Server 自动处理，模型无需开发者中转  
// 调用外部 API -> 校验权限 -> 结果通过协议返回给模型  
{  
"action": "tools.call",  
"tool": "stocks.getPrice",  
"args": { "symbol": "AAPL" }  
}

```
