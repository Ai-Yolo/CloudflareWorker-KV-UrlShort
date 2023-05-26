# CloudflareWorkerKV-UrlShort
URL shortener created using Cloudflare Worker | Supports custom homepage | Supports Menu Short | Supports short URLs, text, web page sharing, ephemeral content, expiration time, and UI adaptive interface.

Since the free plan of [Cloudflare](https://www.cloudflare.com) has limitations, a preview URL is not provided. Please visit [Cloudflare Work](https://dash.cloudflare.com) for deployment.

Normally, the free plan is sufficient for personal use, but you can upgrade to a paid plan if you have high demand.

#### Workers
Each request uses a maximum of 10 milliseconds of CPU time.
The minimum latency after the first request.
Up to 100,000 requests per day (UTC+0).

#### KV
Globally low-latency key-value edge storage.
Up to 100,000 read operations per day.
Up to 1,000 write, delete, and list operations per day.

## Preview Image

<img src="https://github.com/Aiayw/CloudflareWorkerKV-UrlShort/assets/11790369/1275583f-ae22-4ee9-a0dd-fabe40de9c63" alt="Preview Image" width="500" height="auto">

## Constant Settings
```js
// Admin page path (default is "/", can be set to another path like "/admin" if hiding the homepage)
const ADMIN_PATH = "/";
// API path
const API_PATH = "/api";
// Long URL key name
const URL_KEY = "longUrl";
// Short URL key name
const URL_NAME = "shortCode";
// Short URL key name (used for API response)
const SHORT_URL_KEY = "shorturl";
// Static homepage source code link (set to replace the homepage, can be commented out if not needed)
const STATICHTML = "https://github.com/Aiayw/CloudflareWorkerKV-UrlShort/blob/8eb8866c8acfd4ed130dc94f4a2798a78c898ecb/404.html";
```

Response Example
```js
{
 "shortCode":"dfcw",
 "type":"link",
 "shorturl":"https://url.com/dfcw"
}
```

## Custom Homepage

```js
const statichtml = "https://github.com/Aiayw/CloudflareWorkerKV-UrlShort/blob/8eb8866c8acfd4ed130dc94f4a2798a78c898ecb/404.html"
```
Modify the above URL to the source code of your preferred web page. Only a single HTML file is supported. It is recommended to integrate CSS, JS, and scripts into the HTML file.

-------
### Create a Namespace in Workers KV

<img width="1020" alt="Create a Namespace in Workers KV" src="https://user-images.githubusercontent.com/86509331/199402623-677c28da-f5de-42d0-b7f9-b652c89f0311.png">

### Bind the KV Namespace in the Worker's Settings Tab
<img width="1020" alt="Bind KV Namespace 1" src="https://user-images.githubusercontent.com/86509331/199405088-38963240-e967-4a69-921e-f06299d403c1.png">

<img width="1020" alt="Bind KV Namespace 2" src="https://user-images.githubusercontent.com/86509331/199405413-c117ed63-2cf9-4fad-a89e-327cc7b137c2.png">

### Set the variable name as `shortlink` and fill in the KV Namespace with the one you created

<img width="1020

" alt="Bind KV" src="https://user-images.githubusercontent.com/86509331/199404159-9e3c14e9-22ca-4957-958f-19f9ab0af105.png">

### Copy the code from [index.js](/index.js) in this project and save and deploy it in Cloudflare Worker

<img width="1020" alt="Save and Deploy" src="https://github.com/Aiayw/CloudflareWorkerKV-UrlShort/assets/11790369/8b5e8519-32ae-4504-87a8-18945f9f08e1">

### Acknowledgments
Thanks to [Cloudflare](https://www.cloudflare.com) for providing the platform and services.


# 中文描述
-------
# CloudflareWorkerKV-UrlShort
使用Cloudflare Worker创建的URL缩短器｜支持自定义首页｜支持Menu Short｜支持短网址、文本、网页分享、阅后即焚、过期时间、以及界面UI自适应。

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
// 管理员页面路径 （默认为 / 如果隐藏首页可设置为其他路径，例如：/admin ）
const ADMIN_PATH = "/";
// API 路径
const API_PATH = "/api";
// 长链接键名
const URL_KEY = "longUrl";
// 短链接键名
const URL_NAME = "shortCode";
// 短链接键名（用于 API 返回）
const SHORT_URL_KEY = "shorturl";
// 静态首页源码链接 （设置首页替换页面，不需要也可以直接注释掉）
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


### 复制本项目中的[index.js](/index.js)的代码到Cloudflare Worker 点击保存并部署

<img width="1020" alt="点击保存并部署" src="https://github.com/Aiayw/CloudflareWorkerKV-UrlShort/assets/11790369/8b5e8519-32ae-4504-87a8-18945f9f08e1">

### 感谢
感谢[Cloudflare](https://www.cloudflare.com)提供平台和服务。
