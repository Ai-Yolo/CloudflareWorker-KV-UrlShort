// Cloudflare Worker
// This worker uses Cloudflare KV for storing URL data

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
  const turnstileScript = TURNSTILE_SITE_KEY ? 
    '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : 
    '';
  
  const frontendHTML = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>短链接生成器</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔗</text></svg>">
    ${turnstileScript}
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <main class="container mx-auto p-6 max-w-2xl">
        <div class="text-center mb-12">
            <h1 class="text-6xl font-extrabold mb-4">
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 
                hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 transition-all duration-500">
                    简约短链
                </span>
            </h1>
            <p class="text-gray-600 text-lg mb-4">简单、安全的链接缩短服务</p>
            <a href="https://github.com/Ai-Yolo/CloudflareWorker-KV-UrlShort" 
               target="_blank" 
               class="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
                </svg>
                自部署开源地址
            </a>
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
                            <select id="expiry" 
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200">
                                <option value="">永久有效</option>
                                <option value="1h">1小时</option>
                                <option value="24h">24小时</option>
                                <option value="7d">7天</option>
                                <option value="30d">30天</option>
                                <option value="custom">自定义时间</option>
                            </select>
                            <input id="customExpiry" type="datetime-local" 
                                class="hidden w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200">
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
                
                <div class="flex justify-center">
                    ${TURNSTILE_SITE_KEY ? 
                        '<div class="cf-turnstile" data-sitekey="' + TURNSTILE_SITE_KEY + '"></div>' : 
                        ''}
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
      
      let token;
      try {
        token = turnstile.getResponse();
        if (!token) {
          document.getElementById('result').innerHTML = \`<div class="p-4 bg-red-50 rounded-lg"><p class="text-red-800">请完成人机验证</p></div>\`;
          return;
        }
      } catch (error) {
        console.error('Turnstile error:', error);
        document.getElementById('result').innerHTML = \`<div class="p-4 bg-red-50 rounded-lg"><p class="text-red-800">人机验证加载失败，请刷新页面重试</p></div>\`;
        return;
      }
      
      const submitButton = e.target.querySelector('button[type="submit"]');
      const resultDiv = document.getElementById('result');
      
      // 禁用提交按钮并显示加载状态
      submitButton.disabled = true;
      submitButton.textContent = '生成中...';
      resultDiv.innerHTML = '';
      
      try {
        const expiry = document.getElementById('expiry').value;
        let expiryDate = null;

        if (expiry) {
            const now = new Date();
            switch(expiry) {
                case '1h':
                    expiryDate = new Date(now.getTime() + 60 * 60 * 1000);
                    break;
                case '24h':
                    expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'custom':
                    expiryDate = document.getElementById('customExpiry').value;
                    break;
            }
        }

        const formData = {
            url: document.getElementById('url').value,
            slug: document.getElementById('slug').value,
            expiry: expiryDate,
            password: document.getElementById('password').value,
            maxVisits: document.getElementById('maxVisits').value,
            token: token
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
              <p class="text-green-800 font-medium mb-2">
                短链接生成成功！
              </p>
              <div class="flex items-center gap-2">
                <input type="text" value="\${data.shortened}" readonly
                  class="flex-1 p-2 border border-gray-300 rounded bg-white">
                <button onclick="copyToClipboard(this, '\${data.shortened}')"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
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
          turnstile.reset();
        }
      } catch (error) {
        resultDiv.innerHTML = \`
          <div class="p-4 bg-red-50 rounded-lg">
            <p class="text-red-800">生成短链接时发生错误，请重试</p>
          </div>
        \`;
        turnstile.reset();
      }
      
      // 恢复提交按钮状态
      submitButton.disabled = false;
      submitButton.textContent = '生成短链接';
    });

    document.getElementById('expiry').addEventListener('change', function() {
        const customExpiryInput = document.getElementById('customExpiry');
        if (this.value === 'custom') {
            customExpiryInput.classList.remove('hidden');
        } else {
            customExpiryInput.classList.add('hidden');
        }
    });

    function copyToClipboard(button, text) {
      navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制!';
        button.classList.add('bg-green-500', 'hover:bg-green-600');
        
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('bg-green-500', 'hover:bg-green-600');
          button.classList.add('bg-blue-500', 'hover:bg-blue-600');
        }, 2000);
      }).catch(() => {
        button.textContent = '复制失败';
        setTimeout(() => {
          button.textContent = '复制';
        }, 2000);
      });
    }
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

      const { url, slug, expiry, password, maxVisits, token } = await request.json();
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

      // 添加最大访问次数验证
      if (maxVisits && (parseInt(maxVisits) <= 0 || isNaN(parseInt(maxVisits)))) {
        return new Response(JSON.stringify({ error: "最大访问次数必须大于0" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 添加自定义有效期验证
      if (expiry) {
        const expiryDate = new Date(expiry);
        const now = new Date();
        if (expiryDate <= now) {
          return new Response(JSON.stringify({ error: "有效期必须大于当前时间" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // 移除URL检查代码，直接生成新的短链接
      const shortSlug = slug || generateSlug();
      
      // 添加自定义短链接长度验证
      if (slug && slug.length < 3) {
        return new Response(JSON.stringify({ error: "自定义链接至少需要3个字符" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

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

      const baseURL = new URL(request.url).origin;
      const shortURL = `${baseURL}/${shortSlug}`;
      return new Response(JSON.stringify({ shortened: shortURL }), {
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

      const { password: correctPassword, url, maxVisits, visits = 0 } = JSON.parse(record);
      const { password: inputPassword, token } = await request.json();

      // 验证 Turnstile token
      if (TURNSTILE_SITE_KEY && TURNSTILE_SECRET) {
        if (!token) {
          return new Response(JSON.stringify({ error: "请完成人机验证" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        
        const tokenValidation = await validateTurnstileToken(token);
        if (!tokenValidation.success) {
          return new Response(JSON.stringify({ error: "人机验证失败" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      if (inputPassword === correctPassword) {
        if (maxVisits) {
          const newVisits = visits + 1;
          await URL_SHORT_KV.put(slug, JSON.stringify({
            ...JSON.parse(record),
            visits: newVisits
          }));
        }

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

    // 只在没有密码保护时更新访问次数
    if (maxVisits && !password) {
      data.visits = visits + 1;
      await URL_SHORT_KV.put(slug, JSON.stringify(data));
    }

    if (password) {
      const turnstileScript = TURNSTILE_SITE_KEY ? 
        '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : 
        '';
      
      const frontendHTML = `<!DOCTYPE html>
      <html lang="zh">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>密码保护链接</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔒</text></svg>">
      ${turnstileScript}
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
              <div class="flex justify-center">
                ${TURNSTILE_SITE_KEY ? 
                    '<div class="cf-turnstile" data-sitekey="' + TURNSTILE_SITE_KEY + '"></div>' : 
                    ''}
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
            
            const token = TURNSTILE_SITE_KEY ? turnstile.getResponse() : null;
            if (TURNSTILE_SITE_KEY && !token) {
              errorDiv.textContent = "请完成人机验证";
              return;
            }
            
            try {
              const response = await fetch('/api/verify/${slug}', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                  password: inputPassword,
                  token: token
                })
              });
              
              const data = await response.json();
              
              if (data.success) {
                window.location.href = data.url;
              } else {
                errorDiv.textContent = "密码错误";
                // 重置 Turnstile
                turnstile.reset();
              }
            } catch (error) {
              errorDiv.textContent = "发生错误，请重试";
              // 发生错误时也重置 Turnstile
              turnstile.reset();
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

function onloadTurnstileCallback() {
  console.log('Turnstile loaded successfully');
}

async function validateTurnstileToken(token) {
  try {
    const formData = new FormData();
    formData.append('secret', TURNSTILE_SECRET);
    formData.append('response', token);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    return { 
      success: data.success,
      error: data['error-codes']
    };
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return { 
      success: false,
      error: ['验证服务器错误']
    };
  }
}
