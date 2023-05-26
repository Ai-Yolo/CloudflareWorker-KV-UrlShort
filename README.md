# CloudflareWorkerKV-UrlShort
使用Cloudflare Worker创建的URL缩短器｜支持自定义首页｜支持Menu Short｜支持短网址、文本、网页分享
阅后即焚，过期时间，以及界面UI自适应。

因为[Cloudflare](https://www.cloudflare.com)的免费套餐有限制，所以不提供预览地址，请自行前往[cloudflare Work](https://dash.cloudflare.com)部署。  

正常来说免费套餐私人使用是完全够的，如有大量需求可付费升级套餐。
#### Workers  
每个请求最多占用 10 毫秒 CPU 时间  
第一个请求后的延迟最低  
每天最多 100,000 个请求 (UTC+0)  
#### KV  
全局性的低延迟键值边缘存储  
每天最多 100,000 次读取操作  
每天最多 1,000 次写入、删除和列出操作  
  
## 预览图

<img src="https://github.com/Aiayw/CloudflareWorkerKV-UrlShort/assets/11790369/1275583f-ae22-4ee9-a0dd-fabe40de9c63" alt="预览图" width="500" height="auto">

## 常量设置
```js
// 管理员页面路径 （默认为 /admin 如果希望打开就到首页则设置为 /）
// const ADMIN_PATH = "/";
const ADMIN_PATH = "/admin";
// API 路径
const API_PATH = "/api";
// 长链接键名
const URL_KEY = "longUrl";
// 短链接键名
const URL_NAME = "shortCode";
// 短链接键名（用于 API 返回）
const SHORT_URL_KEY = "shorturl";
// 静态首页源码链接 （如果管理员页面不为 / 则生效，不需要也可以直接注释掉）
const STATICHTML = "https://github.com/Aiayw/CloudflareWorkerKV-UrlShort/blob/8eb8866c8acfd4ed130dc94f4a2798a78c898ecb/404.html";

```
响应参考
```js
{
 "shortCode":"dfcw",
 "type":"link",
 "shorturl":"https://url.com/dfcw"
}
```

## 自定义首页

```js
const statichtml = "https://github.com/Aiayw/CloudflareWorkerKV-UrlShort/blob/8eb8866c8acfd4ed130dc94f4a2798a78c898ecb/404.html"
```
修改上方网址为自己喜欢的网页源码，只支持单html，建议css和js和script集成进html里

-------
### 去Workers KV中创建一个命名空间

<img width="1020" alt="去Workers KV中创建一个命名空间" src="https://user-images.githubusercontent.com/86509331/199402623-677c28da-f5de-42d0-b7f9-b652c89f0311.png">


### 去Worker的设置选选项卡中绑定KV 命名空间
<img width="1020" alt="绑定KV Namespace 1" src="https://user-images.githubusercontent.com/86509331/199405088-38963240-e967-4a69-921e-f06299d403c1.png">


<img width="1020" alt="绑定KV Namespace 2" src="https://user-images.githubusercontent.com/86509331/199405413-c117ed63-2cf9-4fad-a89e-327cc7b137c2.png">


### 其中变量名称填写`shortlink`, KV 命名空间填写你刚刚创建的命名空间

<img width="1020" alt="绑定kv" src="https://user-images.githubusercontent.com/86509331/199404159-9e3c14e9-22ca-4957-958f-19f9ab0af105.png">


### 复制本项目中的[index.js](/index.js)的代码到Cloudflare Worker 

<img width="1020" alt="复制本项目" src="https://github.com/Aiayw/CF-Worker-KV-Short-Url/assets/11790369/3b06aa75-c08e-46b1-987a-74d93a1d6e8c">


### 点击保存并部署
<img width="1020" alt="点击保存并部署" src="https://github.com/Aiayw/CF-Worker-KV-Short-Url/assets/11790369/d7e8be06-ef7d-4a27-bf06-c57ab85b710f">

### 感谢
感谢[Cloudflare](https://www.cloudflare.com)提供平台和服务。
