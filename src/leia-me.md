# Instalando o couchDB

Para rodar o couchDB, use o docker
No diretorio corrente existe o docker-compose.yml

## Rodando o container

~~~
docker compose up -d
~~~


Depois disso, acesse a interface administrativa e entre com o id: **admin** e senha: **123**

~~~
http://localhost:5984/_utils/#
~~~

## Servidor node

Dispare o servidor node para rodar na porta 7000 e na primeira vez use a  rota /init para criar os bancos de dados no couchDB. Acesse o couchDB e veja se funcionou.

**http://localhost:7000/init** 

~~~
nodemon servidor.js
~~~




## Removendo o container

~~~
docker compose down
~~~
