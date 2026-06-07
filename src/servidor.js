const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const nano = require("nano")("http://admin:123@localhost:5984");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

const SECRET = "segredo";

// conexão CouchDB

var listaBancos;

// usuários fictícios
const professores = [
  {
    id: "fabio",
    email: "fabio@ufsc.br",
    senha: "123",
    disciplinas: ["dec0007", "dec0020", "dec0040"],
  },
  {
    id: "joao",
    email: "joao@ufsc.br",
    senha: "123",
    disciplinas: ["dec0001", "dec0002", "dec0003"],
  },
];

const dec0007 = [
  { aluno: "Ana maria", aulas: [] },
  { aluno: "pedro", aulas: [] },
  { aluno: "cintia", aulas: [] },
];
const dec0020 = [
  { aluno: "Ana maria", aulas: [] },
  { aluno: "pedro", aulas: [] },
  { aluno: "cintua", aulas: [] },
];
const semestre = [
  { disciplina: "dec0007", dados: dec0007 },
  { disciplina: "dec0020", dados: dec0020 },
];

async function criaBD(nomeBanco) {
  try {
    if (listaBancos.includes(nomeBanco)) {
      console.log(`O banco de dados "${nomeBanco}" já existe.`);
    } else {
      console.log(`O banco "${nomeBanco}" não existe. Criando agora...`);
      await nano.db.create(nomeBanco);
      console.log("Banco de dados criado com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao verificar banco:", error.message);
  }
}

async function criaTodosBancosDados() {
  listaBancos = await nano.db.list();

  for (let a = 0; a < professores.length; a++) {
    let lista = professores[a].disciplinas;
    for (let b = 0; b < lista.length; b++) {
      await criaBD(lista[b]);
    }
  }
}

// LOGIN
//

app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const prof = professores.find((p) => p.email === email && p.senha === senha);

  if (!prof) {
    return res.status(401).send("Login inválido");
  }

  const token = jwt.sign(
    {
      id: prof.id,
    },
    SECRET,
  );
  res.json({ token });
});

// middleware autenticação
function autenticar(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).send("Sem token");
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    console.log(decoded.id);
    req.usuario = decoded.id;

    next();
  } catch {
    res.status(401).send("Token inválido");
  }
}

// sincronização
app.get("/init", async (req, res) => {
  // deve ser chamada para precriar os bancos de dados
  await criaTodosBancosDados();
  res.end();
});

function retornaListaDisciplinas(nome) {
  for (let a = 0; a < professores.length; a++) {
    if (nome == professores[a].id) {
      return professores[a].disciplinas;
    }
  }
  return [];
}
function dadosDiscplina(nome) {
  for (let a = 0; a < semestre.length; a++) {
    if (nome == semestre[a].disciplina) {
      return semestre[a].dados;
    }
  }
  return [];
}
// Professor pergunta sua lista de discplinas
app.get("/disciplinas", autenticar, (req, res) => {
  res.send(retornaListaDisciplinas(req.usuario));
});

// Professor pergunta informacoes sobre 1 disciplina
app.get("/disciplinas/:disciplina", autenticar, (req, res) => {
  const disciplina = req.params.disciplina; //
  let x = dadosDiscplina(disciplina);
  res.send(x);
});

// professor sincroniza uma disciplina
app.post("/sync/:disciplina", autenticar, async (req, res) => {
  const disciplina = req.params.disciplina; // quem é o professor
  const disciplinas = retornaListaDisciplinas(req.usuario); // sua lista de disciplinas
  // verifica permissão
  if (!disciplinas.includes(disciplina)) {
    return res.status(403).send("Professor sem acesso a esta disciplina");
  }

  try {
    const db = nano.use(disciplina);

    const docs = req.body.docs;

    for (const doc of docs) {
      await db.insert(doc);
    }

    res.send("Sincronização realizada");
  } catch (err) {
    console.error(err);

    res.status(500).send("Erro");
  }
});

app.listen(7000, () => {
  console.log("Servidor iniciado");
});
