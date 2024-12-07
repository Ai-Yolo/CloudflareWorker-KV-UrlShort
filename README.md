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

![image](https://github.com/user-attachments/assets/25d3c304-3b25-485a-b158-29d795439cbd)

## 常量设置

需要创建一个KV：URL_SHORT_KV并绑定到你创建的Worker

-------
### 去Workers KV中创建一个命名空间
![image](https://github.com/user-attachments/assets/eb761e5d-bdfa-4ef6-8c8f-d347bd27daed)

### 去Worker的设置选选项卡中绑定KV 命名空间
### 其中变量名称填写`URL_SHORT_KV`, KV 命名空间填写你刚刚创建的命名空间

![image](https://github.com/user-attachments/assets/68db428a-c3af-42f7-90fc-43ba91f9cc7b)


### 复制本项目中的[index.js](/index.js)的代码到Cloudflare Worker 点击保存并部署

### 感谢
感谢[Cloudflare](https://www.cloudflare.com)提供平台和服务。
