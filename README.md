# AgilStore Inventário (CLI)

Aplicação em Node.js para gerenciamento de inventário de produtos da AgilStore. Permite adicionar, listar, atualizar, excluir e buscar produtos, com persistência de dados em arquivo JSON.

## Requisitos
- Node.js 14+ instalado
- Terminal/PowerShell

## Instalação
1. Clone o repositório ou copie os arquivos para uma pasta local.
2. Na raiz do projeto, execute:

```bash
npm start
```

O comando acima apenas mostra a ajuda se nenhum parâmetro for passado. Não há dependências externas.

## Como executar
Os comandos devem ser executados a partir da raiz do projeto:

```bash
node src/cli.js <comando> [opções]
```

### Comandos
- adicionar: adiciona um novo produto
  - `--nome <texto>`
  - `--categoria <texto>`
  - `--quantidade <número>`
  - `--preco <número>` (ex.: 1999.90 ou 1999,90)
  - Se algum campo não for informado, será solicitado via prompt no terminal.

- listar: lista produtos
  - `--categoria <texto>` filtra por categoria
  - `--ordenar <campo>` nome | quantidade | preco
  - `--ordem <asc|desc>` ordem da ordenação

- atualizar `<id>`: atualiza um produto existente
  - Pode informar qualquer um dos campos: `--nome`, `--categoria`, `--quantidade`, `--preco`
  - Se nenhum campo for passado, será perguntado via prompt quais campos atualizar.

- excluir `<id>`: exclui um produto
  - `--force` para confirmar sem perguntar

- buscar: busca por id ou parte do nome
  - `--id <id>`
  - `--nome <texto>`

## Exemplos

Adicionar de forma não interativa:
```bash
node src/cli.js adicionar --nome "Smartphone X" --categoria "Smartphone" --quantidade 10 --preco 1999.90
```

Listar todos:
```bash
node src/cli.js listar
```

Listar filtrando e ordenando:
```bash
node src/cli.js listar --categoria "Smartphone" --ordenar preco --ordem desc
```

Atualizar preço e quantidade:
```bash
node src/cli.js atualizar 1 --preco 1899.90 --quantidade 12
```

Excluir confirmando automaticamente:
```bash
node src/cli.js excluir 1 --force
```

Buscar por id:
```bash
node src/cli.js buscar --id 2
```

Buscar por parte do nome:
```bash
node src/cli.js buscar --nome "fone"
```

## Persistência de Dados
- Os dados são salvos automaticamente em `data/products.json`.
- O arquivo é criado na primeira execução, se não existir.

## Tecnologias
- Node.js (CommonJS)
- Leitura/escrita em arquivo JSON

