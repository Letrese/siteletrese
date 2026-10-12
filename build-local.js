/**
 * Script de Build Local para o Portal Letrese (Node.js)
 * Permite compilar e pré-visualizar localmente sem necessidade do Ruby/Jekyll no Windows.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { marked } = require('marked');
const { Liquid } = require('liquidjs');

const ROOT_DIR = __dirname;
const SITE_DIR = path.join(ROOT_DIR, '_site');

// 1. Limpar e criar diretório _site
if (fs.existsSync(SITE_DIR)) {
  fs.rmSync(SITE_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SITE_DIR, { recursive: true });

// 2. Carregar configurações e dados
const configRaw = fs.readFileSync(path.join(ROOT_DIR, '_config.yml'), 'utf8');
const siteConfig = yaml.load(configRaw);

// No ambiente local, desativa prefixo de subdiretório para navegação direta em localhost
const isLocal = process.env.NODE_ENV !== 'production';
const localBaseUrl = isLocal ? '' : (siteConfig.baseurl || '');

const groupData = yaml.load(fs.readFileSync(path.join(ROOT_DIR, '_data', 'group.yml'), 'utf8'));

// 3. Inicializar LiquidJS com suporte a includes e layouts compatíveis com Jekyll
const engine = new Liquid({
  root: [path.join(ROOT_DIR, '_includes'), path.join(ROOT_DIR, '_layouts')],
  extname: '.html',
  jekyllInclude: true
});

// Registrar filtros compatíveis com Jekyll
engine.registerFilter('relative_url', input => {
  if (!input) return localBaseUrl || '/';
  const cleanInput = input.startsWith('/') ? input : '/' + input;
  return localBaseUrl + cleanInput;
});

engine.registerFilter('absolute_url', input => {
  const cleanInput = input && input.startsWith('/') ? input : '/' + (input || '');
  return (siteConfig.url || 'http://localhost:3000') + localBaseUrl + cleanInput;
});

engine.registerFilter('date_to_xmlschema', input => {
  return new Date(input).toISOString();
});

engine.registerFilter('truncate', (input, len = 100) => {
  if (!input) return '';
  return input.length > len ? input.slice(0, len) + '...' : input;
});

engine.registerFilter('jsonify', input => JSON.stringify(input === undefined ? null : input));

engine.registerFilter('markdownify', input => {
  return marked.parse(input || '');
});

// 4. Parser de Front Matter simples
function parseFrontMatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (match) {
    const data = yaml.load(match[1]) || {};
    const body = match[2];
    return { data, body };
  }
  return { data: {}, body: content };
}

// 5. Carregar Coleções
function loadCollection(folderName, urlPrefix, defaultLayout) {
  const dirPath = path.join(ROOT_DIR, folderName);
  if (!fs.existsSync(dirPath)) return [];
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
  return files.map(file => {
    const filePath = path.join(dirPath, file);
    const { data, body } = parseFrontMatter(filePath);
    const slug = file.replace(/^\d+-/, '').replace(/\.md$/, '');
    const url = `${urlPrefix}/${slug}/`;
    return {
      ...data,
      slug,
      url,
      body,
      content: marked.parse(body),
      contentHtml: marked.parse(body),
      layout: data.layout || defaultLayout
    };
  });
}

const members = loadCollection('_members', '/membros', 'member');
const projects = loadCollection('_projects', '/projetos', 'project');

// Carregar Posts (_posts)
function loadPosts() {
  const dirPath = path.join(ROOT_DIR, '_posts');
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md')).sort().reverse();
  return files.map(file => {
    const filePath = path.join(dirPath, file);
    const { data, body } = parseFrontMatter(filePath);
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
    const postDate = new Date(data.date || file.slice(0, 10));
    const year = postDate.getFullYear();
    const month = String(postDate.getMonth() + 1).padStart(2, '0');
    const day = String(postDate.getDate()).padStart(2, '0');
    const url = `/noticias/${year}/${month}/${day}/${slug}/`;
    return {
      ...data,
      slug,
      url,
      date: postDate,
      body,
      content: marked.parse(body),
      contentHtml: marked.parse(body),
      layout: data.layout || 'post'
    };
  });
}

const posts = loadPosts();

const siteContext = {
  site: {
    ...siteConfig,
    baseurl: localBaseUrl,
    data: {
      group: groupData
    },
    members,
    projects,
    posts
  }
};

// 6. Função de renderização de layouts encadeados
async function renderWithLayout(content, layoutName, pageData) {
  let currentContent = content;
  let currentLayout = layoutName;

  while (currentLayout) {
    const layoutPath = path.join(ROOT_DIR, '_layouts', `${currentLayout}.html`);
    if (!fs.existsSync(layoutPath)) break;

    const layoutFile = fs.readFileSync(layoutPath, 'utf8');
    const { data: layoutData, body: layoutTemplate } = parseFrontMatter(layoutPath);

    const context = {
      ...siteContext,
      content: currentContent,
      page: { ...pageData, ...layoutData }
    };

    currentContent = await engine.parseAndRender(layoutTemplate, context);
    currentLayout = layoutData.layout;
  }

  return currentContent;
}

// 7. Compilar Páginas Raiz
const rootPages = ['index.html', 'sobre.html', 'membros.html', 'projetos.html', 'noticias.html', 'contato.html', '404.html'];

async function buildRootPages() {
  for (const pageName of rootPages) {
    const srcPath = path.join(ROOT_DIR, pageName);
    if (!fs.existsSync(srcPath)) continue;

    const { data, body } = parseFrontMatter(srcPath);
    const renderedBody = await engine.parseAndRender(body, { ...siteContext, page: data });
    const fullHtml = await renderWithLayout(renderedBody, data.layout || 'default', data);

    fs.writeFileSync(path.join(SITE_DIR, pageName), fullHtml, 'utf8');

    // Suporte a URLs amigáveis (/sobre/ -> /sobre/index.html)
    if (pageName !== 'index.html' && pageName !== '404.html' && pageName.endsWith('.html')) {
      const folderName = pageName.replace(/\.html$/, '');
      const outDir = path.join(SITE_DIR, folderName);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), fullHtml, 'utf8');
    }

    console.log(`[Build] Página gerada: ${pageName}`);
  }
}

// 8. Compilar Itens de Coleções
async function buildCollectionItems(items, layoutFallback) {
  for (const item of items) {
    const outDir = path.join(SITE_DIR, item.url.replace(/^\//, ''));
    fs.mkdirSync(outDir, { recursive: true });

    const fullHtml = await renderWithLayout(item.contentHtml, item.layout || layoutFallback, item);
    fs.writeFileSync(path.join(outDir, 'index.html'), fullHtml, 'utf8');
    console.log(`[Build] Item gerado: ${item.url}`);
  }
}

// 9. Copiar Pastas Estáticas
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function runBuild() {
  console.log('--- Iniciando compilação do site Letrese ---');
  await buildRootPages();
  await buildCollectionItems(members, 'member');
  await buildCollectionItems(projects, 'project');
  await buildCollectionItems(posts, 'post');

  // Copiar assets e admin
  copyRecursive(path.join(ROOT_DIR, 'assets'), path.join(SITE_DIR, 'assets'));
  copyRecursive(path.join(ROOT_DIR, 'admin'), path.join(SITE_DIR, 'admin'));

  console.log('--- Compilação estática concluída com sucesso em _site/ ---');
}

runBuild().catch(err => {
  console.error('Erro no build:', err);
  process.exit(1);
});
