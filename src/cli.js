#!/usr/bin/env node
const readline = require("readline");
const {
  adicionar,
  listar,
  encontrarPorId,
  buscarPorNome,
  atualizar,
  excluir,
  parseQuantidade,
  parsePreco,
} = require("./inventory");

function nfBRL(n) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    } else if (token.startsWith("-")) {
      const key = token.slice(1);
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    } else {
      out._.push(token);
    }
  }
  return out;
}

function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function showHelp() {
  const msg = `
AgilStore Inventário CLI

Uso:
  node src/cli.js <comando> [opções]

Comandos:
  adicionar                Adiciona um novo produto
    --nome <texto>         Nome do produto
    --categoria <texto>    Categoria
    --quantidade <número>  Quantidade em estoque
    --preco <número>       Preço (ex.: 1999.90)

  listar                   Lista produtos
    --categoria <texto>    Filtra por categoria
    --ordenar <campo>      nome | quantidade | preco
    --ordem <asc|desc>     Ordem de ordenação

  atualizar <id>           Atualiza um produto pelo id
    --nome <texto>
    --categoria <texto>
    --quantidade <número>
    --preco <número>

  excluir <id>             Exclui um produto pelo id
    --force                Confirma sem perguntar

  buscar                   Busca produto por id ou nome
    --id <id>
    --nome <texto>
`;
  console.log(msg.trim());
}

async function cmdAdicionar(opts) {
  let nome = opts.nome;
  let categoria = opts.categoria;
  let quantidade = opts.quantidade;
  let preco = opts.preco;
  if (nome === undefined) nome = await prompt("Nome do Produto: ");
  if (categoria === undefined) categoria = await prompt("Categoria: ");
  if (quantidade === undefined) quantidade = await prompt("Quantidade em Estoque: ");
  if (preco === undefined) preco = await prompt("Preço: ");
  const created = adicionar({
    nome,
    categoria,
    quantidade,
    preco,
  });
  console.log("Produto adicionado:");
  console.table([
    {
      ID: created.id,
      Nome: created.nome,
      Categoria: created.categoria,
      Quantidade: created.quantidade,
      Preço: nfBRL(created.preco),
    },
  ]);
}

function cmdListar(opts) {
  const produtos = listar({
    categoria: opts.categoria,
    ordenarPor: opts.ordenar,
    ordem: opts.ordem,
  });
  if (!produtos.length) {
    console.log("Nenhum produto cadastrado.");
    return;
  }
  const rows = produtos.map((p) => ({
    ID: p.id,
    Nome: p.nome,
    Categoria: p.categoria,
    Quantidade: p.quantidade,
    Preço: nfBRL(p.preco),
  }));
  console.table(rows);
}

async function cmdAtualizar(id, opts) {
  const alvo = encontrarPorId(id);
  if (!alvo) {
    console.log("ID não encontrado.");
    return;
  }
  let nome = opts.nome;
  let categoria = opts.categoria;
  let quantidade = opts.quantidade;
  let preco = opts.preco;
  if (
    nome === undefined &&
    categoria === undefined &&
    quantidade === undefined &&
    preco === undefined
  ) {
    const quais = await prompt("Quais campos deseja atualizar? (nome,categoria,quantidade,preco): ");
    const campos = String(quais || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (campos.includes("nome")) nome = await prompt("Novo Nome: ");
    if (campos.includes("categoria")) categoria = await prompt("Nova Categoria: ");
    if (campos.includes("quantidade")) quantidade = await prompt("Nova Quantidade: ");
    if (campos.includes("preco")) preco = await prompt("Novo Preço: ");
  }
  const atual = atualizar(id, {
    nome,
    categoria,
    quantidade,
    preco,
  });
  console.log("Produto atualizado:");
  console.table([
    {
      ID: atual.id,
      Nome: atual.nome,
      Categoria: atual.categoria,
      Quantidade: atual.quantidade,
      Preço: nfBRL(atual.preco),
    },
  ]);
}

async function cmdExcluir(id, opts) {
  const alvo = encontrarPorId(id);
  if (!alvo) {
    console.log("ID não encontrado.");
    return;
  }
  let confirmar = opts.force ? "s" : undefined;
  if (confirmar === undefined) {
    confirmar = await prompt(`Confirmar exclusão de "${alvo.nome}" (s/n)? `);
  }
  if (String(confirmar).trim().toLowerCase() !== "s") {
    console.log("Exclusão cancelada.");
    return;
  }
  const removido = excluir(id);
  console.log("Produto excluído:");
  console.table([
    {
      ID: removido.id,
      Nome: removido.nome,
      Categoria: removido.categoria,
      Quantidade: removido.quantidade,
      Preço: nfBRL(removido.preco),
    },
  ]);
}

function cmdBuscar(opts) {
  if (opts.id !== undefined) {
    const p = encontrarPorId(opts.id);
    if (!p) {
      console.log("Produto não encontrado.");
      return;
    }
    console.table([
      {
        ID: p.id,
        Nome: p.nome,
        Categoria: p.categoria,
        Quantidade: p.quantidade,
        Preço: nfBRL(p.preco),
      },
    ]);
    return;
  }
  if (opts.nome !== undefined) {
    const ps = buscarPorNome(opts.nome);
    if (!ps.length) {
      console.log("Nenhum produto encontrado.");
      return;
    }
    const rows = ps.map((p) => ({
      ID: p.id,
      Nome: p.nome,
      Categoria: p.categoria,
      Quantidade: p.quantidade,
      Preço: nfBRL(p.preco),
    }));
    console.table(rows);
    return;
  }
  console.log("Informe --id <id> ou --nome <termo>.");
}

async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    showHelp();
    return;
  }
  const command = argv[0];
  const opts = parseArgs(argv.slice(1));
  if (command === "adicionar") {
    await cmdAdicionar(opts);
    return;
  }
  if (command === "listar") {
    cmdListar(opts);
    return;
  }
  if (command === "atualizar") {
    const id = opts._[0];
    if (!id) {
      console.log("Uso: atualizar <id> [opções]");
      return;
    }
    await cmdAtualizar(id, opts);
    return;
  }
  if (command === "excluir") {
    const id = opts._[0];
    if (!id) {
      console.log("Uso: excluir <id> [--force]");
      return;
    }
    await cmdExcluir(id, opts);
    return;
  }
  if (command === "buscar") {
    cmdBuscar(opts);
    return;
  }
  if (["help", "-h", "--help"].includes(command)) {
    showHelp();
    return;
  }
  console.log("Comando desconhecido.");
  showHelp();
}

main();
