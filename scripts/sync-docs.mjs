import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEST_DIR = path.join(__dirname, '../src/content/docs');
const SRC_DIR = path.join(__dirname, '../../');

const projects = ['ctech', 'editora', 'gospelreads', 'mbalite'];

const IGNORE_DIRS = new Set([
  'node_modules',
  '.venv',
  '.git',
  'dist',
  'build',
  '.astro',
  'public',
  'assets',
  '.next',
]);

async function findMarkdownFiles(dir) {
  let results = [];
  try {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const dirent of list) {
      if (dirent.isDirectory()) {
        if (!IGNORE_DIRS.has(dirent.name)) {
          results = results.concat(await findMarkdownFiles(path.join(dir, dirent.name)));
        }
      } else if (dirent.name.endsWith('.md') || dirent.name.endsWith('.mdx')) {
        results.push(path.join(dir, dirent.name));
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`[warn] Diretório não encontrado: ${dir}`);
    } else {
      console.error(`[error] Erro ao ler diretório ${dir}:`, error.message);
    }
  }
  return results;
}

function extractTitle(content, basename, project) {
  const h1Match = content.match(/^#\s+(.*)$/m);
  if (h1Match) return h1Match[1].trim();

  const lower = basename.toLowerCase();
  if (lower === 'readme' || lower === 'index') return project;

  return basename;
}

async function processFile(filePath, project) {
  const projectPath = path.join(SRC_DIR, project);
  let relPath = path.relative(projectPath, filePath);
  const destPath = path.join(DEST_DIR, project, relPath);

  await fs.mkdir(path.dirname(destPath), { recursive: true });

  let content = await fs.readFile(filePath, 'utf-8');

  if (!content.trim().startsWith('---')) {
    let title = path.basename(filePath, path.extname(filePath));
    const h1Match = content.match(/^#\s+(.*)$/m);
    if (h1Match) {
      title = h1Match[1].trim();
      content = content.replace(h1Match[0], '');
    } else if (title.toLowerCase() === 'readme' || title.toLowerCase() === 'index') {
      title = project;
    }
    const frontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\n---\n\n`;
    content = frontmatter + content;
  }

  await fs.writeFile(destPath, content, 'utf-8');
  console.log(`  ${relPath}`);
}

async function main() {
  const allSyncedFiles = [];

  for (const project of projects) {
    console.log(`\nSyncing ${project}...`);
    const projectDir = path.join(SRC_DIR, project);
    const mdFiles = await findMarkdownFiles(projectDir);

    if (mdFiles.length === 0) {
      console.warn(`  [warn] Nenhum arquivo .md/.mdx encontrado em ${projectDir}`);
      continue;
    }

    let count = 0;
    for (const file of mdFiles) {
      if (file.includes('src/content/docs')) continue;
      await processFile(file, project);
      allSyncedFiles.push(file);
      count++;
    }
    console.log(`  -> ${count} arquivo(s) sincronizado(s)`);
  }

  const total = allSyncedFiles.length;
  console.log(`\nSync concluído. ${total} arquivo(s) processado(s).`);
}

main().catch((err) => {
  console.error('[fatal] Sync falhou:', err.message);
  process.exit(1);
});
