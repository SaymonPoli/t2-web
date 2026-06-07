var token = "";

// ------------------------ POST ------------------------------------
async function POST(rota, valor) {
  let resposta = await fetch(rota, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(valor),
  });
  resposta = await resposta.json();
  return resposta;
}
// ------------------------------------------------------------------

// ------------------------ GET ------------------------------------
async function GET(rota) {
  let resposta;
  try {
    resposta = await fetch(rota, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    if (resposta.status === 401) {
      console.log("Não autorizado");
      resposta = {};
      return;
    }
    resposta = await resposta.json();
  } catch (e) {
    resposta = {};
  }

  return resposta;
}
// ------------------------------------------------------------------
