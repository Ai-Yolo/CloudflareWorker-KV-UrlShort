// 管理员页面路径 （默认为 /admin 如果希望打开就到首页则设置为 /）
// const ADMIN_PATH = "/";
const ADMIN_PATH = "/";
// API 路径
const API_PATH = "/api";
// 长链接键名
const URL_KEY = "longUrl";
// 短链接键名
const URL_NAME = "shortCode";
// 短链接键名（用于 API 返回）
const SHORT_URL_KEY = "shorturl";
// 静态首页源码链接 （如果管理员页面不为 / 则生效，不需要也可以直接注释掉）
// const STATICHTML = "https://github.com/Aiayw/CloudflareWorkerKV-UrlShort/blob/8eb8866c8acfd4ed130dc94f4a2798a78c898ecb/404.html";


const index = `<!doctype html>
<html lang="zh-CN">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.2.3/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/5.2.3/js/bootstrap.min.js"></script>
    <script async src="https://umami.aiayw.com/script.js" data-website-id="1b4b644e-8552-452e-8c58-f6efb03ba42b"></script>
    <link rel="icon"
        href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔗</text></svg>">
    <title>简短分享 - 长网址缩短，文本分享，Html单页分享</title>
</head>

<style>
    .bd-placeholder-img {
        font-size: 1.125rem;
        text-anchor: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
    }

    .btn-secondary,
    .btn-secondary:hover,
    .btn-secondary:focus {
        color: #333;
        text-shadow: none;
    }

    body {
        text-shadow: 0 .05rem .1rem rgba(0, 0, 0, .5);
    }

    .cover-container {
        max-width: 42em;
    }

    .navbar-brand svg {
        width: 30px;
        height: 30px;
    }

    @media (max-width: 576px) {
        #input-container .form-control,
        #input-container .input-group-text {
            display: block;
            width: 100%;
            margin-bottom: 1rem;
            border-radius: 5px;
        }
        }

    .footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 60px;
    }

    .footer .container {
        width: 100%;
        height: 100%;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .black-toast .toast {
        background-color: black;
      }

    .text-muted {
        font-size: 14px;
        color: #555;
        margin-right: 20px;
    }
</style>

<body class="d-flex h-100 text-center text-white bg-dark">

    <div class="position-fixed top-0 end-0 p-3 black-toast" style="z-index: 5;">
        <div id="toast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-body">
                已复制到剪贴板！
            </div>
        </div>
    </div>

    <div class="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
        <header class="mb-auto">
            <nav class="navbar navbar-expand-md navbar-dark">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">
                        <svg t="1682502812036" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="1958" width="64" height="64">
                            <path
                                d="M429.013333 640A32 32 0 0 1 384 594.986667l37.76-37.76-22.826667-22.613334-135.68 135.68 90.453334 90.453334 135.68-135.68-22.613334-22.613334zM534.613333 398.933333l22.613334 22.613334L594.986667 384A32 32 0 0 1 640 429.013333l-37.76 37.76 22.613333 22.613334 135.68-135.68-90.453333-90.453334z"
                                fill="#666666" p-id="1959"></path>
                            <path
                                d="M512 21.333333a490.666667 490.666667 0 1 0 490.666667 490.666667A490.666667 490.666667 0 0 0 512 21.333333z m316.8 354.986667l-181.12 181.12a32 32 0 0 1-45.226667 0L557.226667 512 512 557.226667l45.226667 45.226666a32 32 0 0 1 0 45.226667l-181.12 181.12a32 32 0 0 1-45.226667 0l-135.68-135.68a32 32 0 0 1 0-45.226667l181.12-181.12a32 32 0 0 1 45.226667 0L466.773333 512 512 466.773333l-45.226667-45.226666a32 32 0 0 1 0-45.226667l181.12-181.12a32 32 0 0 1 45.226667 0l135.68 135.68a32 32 0 0 1 0 45.226667z"
                                fill="#666666" p-id="1960"></path>
                        </svg>
                        简短分享
                    </a>
                </div>
            </nav>
        </header>

        <main class="px-3">
            <p id="result" class="lead" onclick="copyToClipboard()"></p>

            <br>
            <div id="input-container">
                <div id="link_div" class="input-group mb-3">
                    <select class="form-control" id="select">
                        <option value="link">Link</option>
                        <option value="text">Text</option>
                        <option value="html">HTML</option>
                    </select>
                    <select class="form-control" id="expiration">
                        <option value="-1">无限制</option>
                        <option value="burn_after_reading">阅后即焚</option>
                        <option value="1">1分钟</option>
                        <option value="10">10分钟</option>
                        <option value="60">1小时</option>
                        <option value="1440">1天</option>
                        <option value="10080">7天</option>
                        <option value="43200">1个月</option>
                    </select>
                    <input type="text" id="name" placeholder="自定义后缀" class="input-group-text">
                </div>
            </div>
            <div id="text_div">
                <textarea id="link" placeholder="输入链接/文本/HTML源代码" class="form-control" rows="10"></textarea><br>
            </div>
            <p class="lead">
                <a href="#" onclick="getlink()" class="btn btn-lg btn-secondary fw-bold border-white bg-white">生成</a>
            </p>
        </main>

    </div>
    
    <footer class="footer">
        <div class="container">
            <a href="https://github.com/Aiayw/CF-Worker-KV-Short-Url" class="text-muted">开源项目，自行部署</a>
        </div>
    </footer>

    <script>
        async function postData(url = '', data = {}) {
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
                body: JSON.stringify(data)
            });
            return response.json();
        }

        function isValidUrl(string) {
            try {
            new URL(string);
            return true;
            } catch (_) {
            return false;
            }
        }
      
        function copyToClipboard() {
            const textToCopy = document.getElementById('result').innerText;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const toast = new bootstrap.Toast(document.getElementById('toast'));
                    toast.show();
                }).catch(err => {
                    console.error('无法复制文本: ', err);
                });
            } else {
                alert('没有文本可复制');
            }
        }
        
        function getlink() {
            let link = document.getElementById('link').value.trim()
            const name = document.getElementById('name').value
            const type = document.getElementById('select').value
            if (link === '') {
                document.getElementById('result').innerHTML = "请输入链接/文本/HTML源代码"
                return;
            }
            if (link.indexOf('http') == -1 && type == "link") {
                link = 'http://' + link
            }
            if (type == "link" && !isValidUrl(link)) {
                document.getElementById('result').innerHTML = "请输入有效的URL格式"
                return;
            }
            document.getElementById('result').innerHTML = "生成中.."
            const expirationElement = document.getElementById('expiration');
            const selectedIndex = expirationElement.selectedIndex;
            const expiration = expirationElement.options[selectedIndex].value;
            const burnAfterReading = expiration === 'burn_after_reading';
            postData("${API_PATH}", {
                "${URL_KEY}": link,
                "${URL_NAME}": name,
                "type": type,
                "expiration": burnAfterReading ? -1 : expiration,
                "burn_after_reading": burnAfterReading
              }).then(resp => {
                if (resp.error) {
                  document.getElementById('result').innerHTML = resp.error;
                  document.getElementById('name').value = ''
                } else if (resp.value) {
                  document.getElementById('result').innerHTML = resp.value;
                } else {
                  var url = document.location.protocol + '//' + document.location.host + '/' + resp['${URL_NAME}']
                  document.getElementById('result').innerHTML = url
                  document.getElementById('link').value = ''
                  document.getElementById('name').value = ''
                  document.getElementById('select').selectedIndex = 0
                }
              });
              
        }

    </script>

</body>

</html>`;

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Respond with hello worker text
 * @param {Request} request
 */

async function handleRequest(request) {
  const { protocol, hostname, pathname } = new URL(request.url);
  // index.html
  if (pathname == ADMIN_PATH) {
    return new Response(index, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
  // short api
if (pathname.startsWith(API_PATH)) {
    const body = JSON.parse(await request.text());
    console.log(body);
    var short_type = "link";
    if (body["type"] != undefined && body["type"] != "") {
      short_type = body["type"];
    }
    if (
      body[URL_NAME] == undefined ||
      body[URL_NAME] == "" ||
      body[URL_NAME].length < 2
    ) {
      body[URL_NAME] = Math.random().toString(36).slice(-6);
    }
    
    // 检查自定义后缀是否已经存在
    if (await shortlink.get(body[URL_NAME])) {
      return new Response(
        JSON.stringify({ error: "该后缀已经被使用，请使用其他后缀。" }),
        {
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }
    
    const expiration = parseInt(body["expiration"]);
    let expiresAt = null;
    await shortlink.put(
      body[URL_NAME],
      JSON.stringify({
        type: short_type,
        value: body[URL_KEY],
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        burn_after_reading: body["burn_after_reading"], 
      })
    );
     // Remove other fields from the response body
    const responseBody = {
      type: body.type,
      shorturl: `${protocol}//${hostname}/${body[URL_NAME]}`,
      shortCode: body[URL_NAME],
    };
    
    // Add Access-Control-Allow-Origin header to the response
    return new Response(JSON.stringify(responseBody), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
  
  const key = pathname.replace("/", "");
  if (key !== "" && !(await shortlink.get(key))) {
    return Response.redirect(`${protocol}//${hostname}${ADMIN_PATH}`, 302);
  }
  if (key == "") {
    const html = await fetch(STATICHTML);
    return new Response(await html.text(), {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }
  let link = await shortlink.get(key);
  if (link != null) {
    link = JSON.parse(link);
    console.log(link);
    const expiresAt = link["expiresAt"] ? new Date(link["expiresAt"]) : null;
    const now = new Date();
    if (expiresAt && now >= expiresAt) {
      return new Response(`链接已过期`, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    // 删除阅后即焚的链接
    if (link["burn_after_reading"]) {
      await shortlink.delete(key);
    }
    // redirect
    if (link["type"] == "link") {
      return Response.redirect(link["value"], 302);
    }
    if (link["type"] == "html") {
      return new Response(link["value"], {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } else {
      // textarea
      return new Response(`${link["value"]}`, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  }
  return new Response(`403`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
