const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "products.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function loadProducts() {
  ensureStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw || "[]");
    if (!Array.isArray(data)) return [];
    return data.map((p) => ({
      id: p.id,
      nome: String(p.nome || "").trim(),
      categoria: String(p.categoria || "").trim(),
      quantidade: Number(p.quantidade || 0),
      preco: Number(p.preco || 0),
    }));
  } catch {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
    return [];
  }
}

function saveProducts(products) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf-8");
}

function nextId(products) {
  if (!products.length) return 1;
  const max = products.reduce((m, p) => (p.id > m ? p.id : m), 0);
  return max + 1;
}

function validarNome(nome) {
  const v = String(nome || "").trim();
  return v.length > 0 ? v : null;
}

function validarCategoria(categoria) {
  const v = String(categoria || "").trim();
  return v.length > 0 ? v : null;
}

function parseQuantidade(valor) {
  const n = Number.parseInt(String(valor).trim(), 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

function parsePreco(valor) {
  const s = String(valor).replace(",", ".").trim();
  const n = Number.parseFloat(s);
  if (Number.isNaN(n) || n < 0) return null;
  return Number(n.toFixed(2));
}

function adicionar({ nome, categoria, quantidade, preco }) {
  const nomeVal = validarNome(nome);
  const categoriaVal = validarCategoria(categoria);
  const quantidadeVal = parseQuantidade(quantidade);
  const precoVal = parsePreco(preco);
  if (nomeVal === null) throw new Error("Nome inválido");
  if (categoriaVal === null) throw new Error("Categoria inválida");
  if (quantidadeVal === null) throw new Error("Quantidade inválida");
  if (precoVal === null) throw new Error("Preço inválido");
  const produtos = loadProducts();
  const novo = {
    id: nextId(produtos),
    nome: nomeVal,
    categoria: categoriaVal,
    quantidade: quantidadeVal,
    preco: precoVal,
  };
  produtos.push(novo);
  saveProducts(produtos);
  return novo;
}

function listar({ categoria, ordenarPor, ordem } = {}) {
  let produtos = loadProducts();
  if (categoria) {
    const alvo = String(categoria).trim().toLowerCase();
    produtos = produtos.filter(
      (p) => String(p.categoria).trim().toLowerCase() === alvo
    );
  }
  if (ordenarPor) {
    const key = String(ordenarPor).trim().toLowerCase();
    const dir = String(ordem || "asc").trim().toLowerCase();
    const mult = dir === "desc" ? -1 : 1;
    produtos = produtos.slice().sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      if (typeof va === "string" && typeof vb === "string") {
        return va.localeCompare(vb) * mult;
      }
      if (va < vb) return -1 * mult;
      if (va > vb) return 1 * mult;
      return 0;
    });
  }
  return produtos;
}

function encontrarPorId(id) {
  const pid = Number.parseInt(String(id), 10);
  if (Number.isNaN(pid)) return null;
  const produtos = loadProducts();
  return produtos.find((p) => p.id === pid) || null;
}

function buscarPorNome(parte) {
  const q = String(parte || "").trim().toLowerCase();
  if (!q) return [];
  const produtos = loadProducts();
  return produtos.filter((p) =>
    String(p.nome).trim().toLowerCase().includes(q)
  );
}

function atualizar(id, campos) {
  const pid = Number.parseInt(String(id), 10);
  if (Number.isNaN(pid)) throw new Error("ID inválido");
  const produtos = loadProducts();
  const idx = produtos.findIndex((p) => p.id === pid);
  if (idx === -1) throw new Error("Produto não encontrado");
  const atual = produtos[idx];
  const updates = {};
  if (campos.nome !== undefined) {
    const v = validarNome(campos.nome);
    if (v === null) throw new Error("Nome inválido");
    updates.nome = v;
  }
  if (campos.categoria !== undefined) {
    const v = validarCategoria(campos.categoria);
    if (v === null) throw new Error("Categoria inválida");
    updates.categoria = v;
  }
  if (campos.quantidade !== undefined) {
    const v = parseQuantidade(campos.quantidade);
    if (v === null) throw new Error("Quantidade inválida");
    updates.quantidade = v;
  }
  if (campos.preco !== undefined) {
    const v = parsePreco(campos.preco);
    if (v === null) throw new Error("Preço inválido");
    updates.preco = v;
  }
  const novo = { ...atual, ...updates };
  produtos[idx] = novo;
  saveProducts(produtos);
  return novo;
}

function excluir(id) {
  const pid = Number.parseInt(String(id), 10);
  if (Number.isNaN(pid)) throw new Error("ID inválido");
  const produtos = loadProducts();
  const idx = produtos.findIndex((p) => p.id === pid);
  if (idx === -1) throw new Error("Produto não encontrado");
  const removido = produtos[idx];
  produtos.splice(idx, 1);
  saveProducts(produtos);
  return removido;
}

module.exports = {
  loadProducts,
  saveProducts,
  adicionar,
  listar,
  encontrarPorId,
  buscarPorNome,
  atualizar,
  excluir,
  parseQuantidade,
  parsePreco,
};
