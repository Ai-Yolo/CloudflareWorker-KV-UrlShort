// Cloudflare Worker
// This worker uses Cloudflare KV for storing URL data

// KV Namespace binding
// const URL_SHORT_KV = "URL_SHORT_KV"; // Bind this in Cloudflare Worker settings

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const { pathname } = url;

    // Handle favicon request
    if (pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }

    if (pathname === "/") {
      // Serve the frontend
      return serveFrontend();
    }

    if (pathname.startsWith("/api")) {
      // Handle API requests
      return handleAPIRequest(request);
    }

    // Redirect for short URLs
    return handleRedirect(pathname);
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response('服务器内部错误', { status: 500 });
  }
}

async function serveFrontend() {
  const frontendHTML = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>短链接生成器</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔗</text></svg>">
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <main class="container mx-auto p-6 max-w-2xl">
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">短链接生成器</h1>
            <p class="text-gray-600">快速生成安全可靠的短链接</p>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg p-8 backdrop-blur-sm bg-opacity-90">
            <form id="shorten-form" class="space-y-6">
                <div class="space-y-4">
                    <div>
                        <label for="url" class="block text-sm font-semibold text-gray-700 mb-2">
                            输入链接
                            <span class="text-gray-500 font-normal">（必填）</span>
                        </label>
                        <input id="url" type="url" 
                            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200" 
                            placeholder="https://example.com" required>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label for="slug" class="block text-sm font-semibold text-gray-700 mb-2">
                                自定义短链接
                                <span class="text-gray-500 font-normal">（可选）</span>
                            </label>
                            <input id="slug" type="text" 
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200" 
                                placeholder="自定义链接">
                        </div>
                        <div>
                            <label for="expiry" class="block text-sm font-semibold text-gray-700 mb-2">
                                有效期
                                <span class="text-gray-500 font-normal">（可选）</span>
                            </label>
                            <input id="expiry" type="datetime-local" 
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                placeholder="选择到期时间">
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                                访问密码
                                <span class="text-gray-500 font-normal">（可选）</span>
                            </label>
                            <input id="password" type="password" 
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200" 
                                placeholder="设置密码">
                        </div>
                        <div>
                            <label for="maxVisits" class="block text-sm font-semibold text-gray-700 mb-2">
                                最大访问次数
                                <span class="text-gray-500 font-normal">（可选）</span>
                            </label>
                            <input id="maxVisits" type="number" 
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200" 
                                placeholder="10">
                        </div>
                    </div>
                </div>
                
                <button type="submit" 
                    class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition duration-200">
                    生成短链接
                </button>
            </form>
            
            <div id="result" class="mt-8"></div>
        </div>
    </main>

    <script>
    document.getElementById('shorten-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = e.target.querySelector('button[type="submit"]');
      const resultDiv = document.getElementById('result');
      
      // 禁用提交按钮并显示加载状态
      submitButton.disabled = true;
      submitButton.textContent = '生成中...';
      resultDiv.innerHTML = '';
      
      try {
        const formData = {
          url: document.getElementById('url').value,
          slug: document.getElementById('slug').value,
          expiry: document.getElementById('expiry').value,
          password: document.getElementById('password').value,
          maxVisits: document.getElementById('maxVisits').value
        };
        
        const response = await fetch('/api/shorten', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          resultDiv.innerHTML = \`
            <div class="p-4 bg-green-50 rounded-lg">
              <p class="text-green-800 font-medium mb-2">短链接生成成功！</p>
              <div class="flex items-center gap-2">
                <input type="text" value="\${data.shortened}" readonly
                  class="flex-1 p-2 border border-gray-300 rounded bg-white">
                <button onclick="navigator.clipboard.writeText('\${data.shortened}')"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  复制
                </button>
              </div>
            </div>
          \`;
        } else {
          resultDiv.innerHTML = \`
            <div class="p-4 bg-red-50 rounded-lg">
              <p class="text-red-800">\${data.error}</p>
            </div>
          \`;
        }
      } catch (error) {
        resultDiv.innerHTML = \`
          <div class="p-4 bg-red-50 rounded-lg">
            <p class="text-red-800">生成短链接时发生错误，请重试</p>
          </div>
        \`;
      }
      
      // 恢复提交按钮状态
      submitButton.disabled = false;
      submitButton.textContent = '生成短链接';
    });
    </script>
</body>
</html>`;

  return new Response(frontendHTML, {
    headers: { 
      "Content-Type": "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    },
  });
}

async function handleAPIRequest(request) {
  try {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/shorten") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "请求方法不允许" }), { 
          status: 405,
          headers: { 
            "Content-Type": "application/json",
            "Allow": "POST"
          }
        });
      }

      const { url, slug, expiry, password, maxVisits } = await request.json();
      if (!url) {
        return new Response(JSON.stringify({ error: "请输入链接地址" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Validate URL
      try {
        new URL(url);
      } catch {
        return new Response(JSON.stringify({ error: "链接格式无效" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const shortSlug = slug || generateSlug();
      
      // Validate slug format
      if (!/^[a-zA-Z0-9-_]+$/.test(shortSlug)) {
        return new Response(JSON.stringify({ error: "自定义链接格式无效，只能使用字母、数字、横线和下划线" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const existing = await URL_SHORT_KV.get(shortSlug);
      if (existing) {
        return new Response(JSON.stringify({ error: "该自定义链接已被使用" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const expiryTimestamp = expiry ? new Date(expiry).getTime() : null;
      await URL_SHORT_KV.put(shortSlug, JSON.stringify({ 
        url, 
        expiry: expiryTimestamp, 
        password,
        created: Date.now(),
        maxVisits: maxVisits ? parseInt(maxVisits) : null,
        visits: 0
      }));

      const shortURL = new URL(request.url);
      shortURL.pathname = `/${shortSlug}`;
      return new Response(JSON.stringify({ shortened: shortURL.toString() }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (pathname.startsWith('/api/verify/')) {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "请求方法不允许" }), { 
          status: 405,
          headers: { 
            "Content-Type": "application/json",
            "Allow": "POST"
          }
        });
      }

      const slug = pathname.replace('/api/verify/', '');
      const record = await URL_SHORT_KV.get(slug);
      
      if (!record) {
        return new Response(JSON.stringify({ error: "链接不存在" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      const { password: correctPassword, url } = JSON.parse(record);
      const { password: inputPassword } = await request.json();

      if (inputPassword === correctPassword) {
        return new Response(JSON.stringify({ 
          success: true,
          url: url
        }), {
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({ 
          success: false,
          error: "密码错误"
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({ error: "页面不存在" }), { 
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: "服务器内部错误" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleRedirect(pathname) {
  try {
    const slug = pathname.slice(1);
    const record = await URL_SHORT_KV.get(slug);

    if (!record) {
      return new Response("链接不存在", { 
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    const data = JSON.parse(record);
    const { url, expiry, password, maxVisits, visits = 0 } = data;

    if (expiry && Date.now() > expiry) {
      await URL_SHORT_KV.delete(slug);
      return new Response("链接已过期", { 
        status: 410,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    if (maxVisits && visits >= maxVisits) {
      await URL_SHORT_KV.delete(slug);
      return new Response("链接访问次数已达上限", { 
        status: 410,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // Update visit count
    if (maxVisits) {
      data.visits = visits + 1;
      await URL_SHORT_KV.put(slug, JSON.stringify(data));
    }

    if (password) {
      const frontendHTML =`<!DOCTYPE html>
      <html lang="zh">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>密码保护链接</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔒</text></svg>">
      </head>
      <body class="bg-gray-100">
        <main class="container mx-auto p-4 max-w-md min-h-screen flex items-center justify-center">
          <div class="bg-white rounded-lg shadow-md p-6 w-full">
            <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">密码保护链接</h1>
            <form id="password-form" class="space-y-4">
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">请输入访问码：</label>
                <input id="password" type="password" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
              </div>
              <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                访问链接
              </button>
            </form>
            <div id="error" class="mt-4 text-red-500 text-center"></div>
          </div>
        </main>
        <script>
          document.getElementById('password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = e.target.querySelector('button[type="submit"]');
            const inputPassword = document.getElementById('password').value;
            const errorDiv = document.getElementById('error');
            
            submitButton.disabled = true;
            submitButton.textContent = '验证中...';
            errorDiv.textContent = '';
            
            try {
              const response = await fetch('/api/verify/${slug}', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: inputPassword })
              });
              
              const data = await response.json();
              
              if (data.success) {
                window.location.href = data.url;
              } else {
                errorDiv.textContent = "密码错误";
              }
            } catch (error) {
              errorDiv.textContent = "发生错误，请重试";
            } finally {
              submitButton.disabled = false;
              submitButton.textContent = '访问链接';
            }
          });
        </script>
      </body>
      </html>`;

      return new Response(frontendHTML, {
        headers: { 
          "Content-Type": "text/html",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        },
      });
    }

    return Response.redirect(url, 302);
  } catch (error) {
    console.error('Redirect Error:', error);
    return new Response("服务器内部错误", { 
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}

function generateSlug(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
