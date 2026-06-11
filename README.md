# t2-web

Este projeto utiliza CouchDB e Node.js. Siga as instruções abaixo para configurar e rodar o ambiente.

## Configuração do CouchDB

Para rodar o CouchDB, utilizamos Docker. No diretório `src/` existe um arquivo `docker-compose.yml` e um `Makefile` para facilitar a configuração.

### 1. Rodar o container e configurar o CORS

É necessário configurar o CORS no CouchDB para que a aplicação web possa se comunicar com ele. Para isso, execute os seguintes comandos dentro da pasta `src/`:

```bash
cd src
make setup
```

O comando `make setup` irá subir o container Docker e configurar automaticamente as políticas de CORS necessárias.

### 2. Acessar a interface administrativa

Após subir o container, você pode acessar a interface do Fauxton:

- **URL:** [http://localhost:5984/_utils/#](http://localhost:5984/_utils/#)
- **Usuário:** `admin`
- **Senha:** `123`

## Servidor Node.js

O servidor Node roda na porta 7000.

### 1. Instalação de dependências

Certifique-se de instalar as dependências antes de rodar (dentro da pasta `src/`):

```bash
npm install
```

### 2. Execução do servidor

Para rodar o servidor (recomenda-se o uso do `nodemon`):

```bash
nodemon servidor.js
```

### 3. Inicialização do Banco de Dados

Na primeira vez que rodar a aplicação, acesse a rota `/init` para criar os bancos de dados necessários no CouchDB:

**[http://localhost:7000/init](http://localhost:7000/init)**

Acesse a interface do CouchDB para verificar se os bancos foram criados corretamente.

## Encerrando o ambiente

Para remover os containers e encerrar o serviço:

```bash
cd src
docker-compose down
```
