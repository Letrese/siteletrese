/**
 * Proxy de Autenticação GitHub OAuth para Decap CMS
 * Implementação para Cloudflare Workers
 * 
 * Variáveis de ambiente necessárias no Cloudflare Worker:
 * - GITHUB_CLIENT_ID: O Client ID do GitHub OAuth App
 * - GITHUB_CLIENT_SECRET: O Client Secret do GitHub OAuth App
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Rota de Início de Autenticação: redireciona para o GitHub
    if (url.pathname === '/auth') {
      const scope = url.searchParams.get('scope') || 'repo,user';
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=${encodeURIComponent(scope)}`;
      return Response.redirect(githubAuthUrl, 302);
    }

    // 2. Rota de Callback: troca o "code" temporário pelo access_token
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');

      if (!code) {
        return new Response('Código de autorização não fornecido.', { status: 400 });
      }

      try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'Decap-CMS-OAuth-Worker'
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code: code
          })
        });

        const data = await response.json();

        if (data.error) {
          return new Response(`Erro de autenticação: ${data.error_description || data.error}`, { status: 401 });
        }

        const token = data.access_token;
        const content = {
          token: token,
          provider: 'github'
        };

        // Resposta HTML que envia o token de volta ao Decap CMS via postMessage
        const html = `
          <!doctype html>
          <html>
            <body>
              <p>Autenticação concluída com sucesso! Retornando ao painel administrativo...</p>
              <script>
                (function() {
                  function receiveMessage(e) {
                    window.opener.postMessage(
                      'authorization:github:success:${JSON.stringify(content)}',
                      e.origin
                    );
                  }
                  window.addEventListener("message", receiveMessage, false);
                  window.opener.postMessage("authorizing:github", "*");
                })();
              </script>
            </body>
          </html>
        `;

        return new Response(html, {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });

      } catch (err) {
        return new Response(`Erro interno no servidor: ${err.message}`, { status: 500 });
      }
    }

    // 3. Rota de verificação / raiz
    if (url.pathname === '/') {
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Letrese Decap CMS GitHub OAuth Proxy',
        documentation: 'Endpoints: /auth e /callback'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Não encontrado', { status: 404 });
  }
};
