# 📚 Central de Documentação do Portal Letrese

> **TL;DR:**  
> Este portal é um site acadêmico 100% estático hospedado no **GitHub Pages** (sem custo de servidor). Qualquer pessoa autorizada pode cadastrar conteúdos visualmente acessando [letrese.github.io/siteletrese/admin/](https://letrese.github.io/siteletrese/admin/) e fazendo login com sua conta do GitHub. Alterações entram no ar automaticamente em cerca de 1 a 2 minutos.

---

## 🗂️ Guias Disponíveis nesta Pasta

| Guia | Para quem é | Conteúdo principal |
| :--- | :--- | :--- |
| **[Manual de Cadastro de Informações](MANUAL_DE_CADASTRO.md)** | **Toda a equipe / Bolsistas** | Passo a passo para cadastrar Membros, Projetos, Notícias e Linhas de Pesquisa pelo painel visual ou pelo GitHub. |
| **[Manutenção e Deploy](MANUTENCAO_E_DEPLOY.md)** | **Mantenedores / Desenvolvedores** | Como o site funciona por trás dos panos (Jekyll + GitHub Pages + Cloudflare Worker), como rodar localmente e estrutura de pastas. |
| **[Resolução de Problemas](RESOLUCAO_DE_PROBLEMAS.md)** | **Todos** | Solução rápida para problemas comuns: cache que não atualiza, erro 404, falhas de login no admin e credenciais. |
| **[Guia do OAuth e Cloudflare](GUIA_ADMIN_E_OAUTH.md)** | **Administradores técnicos** | Detalhes da configuração do GitHub OAuth App e do Worker da Cloudflare (`letrese-oauth`). |

---

## 🌐 Links Rápidos do Portal

* **Site Oficial:** [https://letrese.github.io/siteletrese/](https://letrese.github.io/siteletrese/)
* **Painel Administrativo:** [https://letrese.github.io/siteletrese/admin/](https://letrese.github.io/siteletrese/admin/)
* **Repositório GitHub:** [https://github.com/Letrese/siteletrese](https://github.com/Letrese/siteletrese)
* **Histórico de Publicações (Actions):** [https://github.com/Letrese/siteletrese/actions](https://github.com/Letrese/siteletrese/actions)
* **Proxy de Login (Cloudflare):** `https://letrese-oauth.gakimuro.workers.dev`

---

## 👥 Quem pode editar o site?

Qualquer pessoa que tenha **permissão de escrita (colaborador)** no repositório GitHub `Letrese/siteletrese`. Para liberar acesso a um novo pesquisador ou bolsista:
1. No repositório GitHub, acesse **Settings > Collaborators**.
2. Clique em **Add people** e convide o usuário do GitHub da pessoa.
3. Assim que ela aceitar o convite, já poderá fazer login em `/admin/` e publicar conteúdos.
