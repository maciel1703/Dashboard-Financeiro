// transações JS //

let transacoes = carregarTransacoes();

const modalOverlay = document.getElementById("modal-overlay");
const modalForm = document.getElementById("modal-form");

const btnNovaTransacao = document.getElementById("btn-nova-transacao");
const btnCancelar = document.getElementById("modal-cancelar");

const campoId = document.getElementById("transacao-id");
const campoDescricao = document.getElementById("campo-descricao");
const campoValor = document.getElementById("campo-valor");
const campoTipo = document.getElementById("campo-tipo");
const campoCategoria = document.getElementById("campo-categoria");
const campoData = document.getElementById("campo-data");

const listaTransacoes = document.getElementById("lista-transacoes");
const listaEmpty = document.getElementById("lista-empty");

const seletorPeriodo = document.getElementById("periodo");
const seletorTipo = document.getElementById("tipo");
const seletorCategoria = document.getElementById("categoria");

const nomesCategorias = {
  alimentacao: "Alimentação",
  transporte: "Transporte",
  moradia: "Moradia",
  lazer: "Lazer",
  educacao: "Educação",
  salario: "Salário",
  outros: "Outros"
};

// ---------- LOCALSTORAGE ----------

function carregarTransacoes() {
  const dados = localStorage.getItem("fintrack-transacoes");
  return dados ? JSON.parse(dados) : [];
}

function salvarTransacoes() {
  localStorage.setItem("fintrack-transacoes", JSON.stringify(transacoes));
}

// ---------- ABRIR / FECHAR MODAL ----------

btnNovaTransacao.addEventListener("click", function (event) {
  event.preventDefault();
  campoId.value = "";
  modalForm.reset();
  campoData.value = new Date().toISOString().slice(0, 10);
  modalOverlay.classList.add("aberto");
});

btnCancelar.addEventListener("click", function () {
  modalOverlay.classList.remove("aberto");
});

modalOverlay.addEventListener("click", function (event) {
  if (event.target === modalOverlay) {
    modalOverlay.classList.remove("aberto");
  }
});

// ---------- SALVAR (CRIAR OU EDITAR) ----------

modalForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const dadosFormulario = {
    descricao: campoDescricao.value,
    valor: parseFloat(campoValor.value),
    tipo: campoTipo.value,
    categoria: campoCategoria.value,
    data: campoData.value
  };

  if (campoId.value) {
    // edição: mantém o id, substitui o resto
    const indice = transacoes.findIndex(function (t) {
      return t.id === campoId.value;
    });

    if (indice !== -1) {
      transacoes[indice] = Object.assign({ id: campoId.value }, dadosFormulario);
    }
  } else {
    // criação
    dadosFormulario.id = crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString();

    transacoes.push(dadosFormulario);
  }

  salvarTransacoes();
  renderizarTransacoes();
  atualizarCards();

  modalOverlay.classList.remove("aberto");
  modalForm.reset();
});

// ---------- FILTROS ----------

function transacoesFiltradas() {

  const periodo = seletorPeriodo.value;
  const tipo = seletorTipo.value;
  const categoria = seletorCategoria.value;

  const hoje = new Date();

  return transacoes.filter(function (transacao) {

    // filtro de tipo
    if (tipo === "receita-transacoes" && transacao.tipo !== "receita") return false;
    if (tipo === "despesa-transacoes" && transacao.tipo !== "despesa") return false;

    // filtro de categoria
    if (categoria !== "todos" && transacao.categoria !== categoria) return false;

    // filtro de período
    if (periodo !== "todos") {
      const dataTransacao = new Date(transacao.data + "T00:00:00");

      if (periodo === "este-mes") {
        if (
          dataTransacao.getMonth() !== hoje.getMonth() ||
          dataTransacao.getFullYear() !== hoje.getFullYear()
        ) return false;
      }

      if (periodo === "ultimos-meses") {
        const limite = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
        if (dataTransacao < limite) return false;
      }

      if (periodo === "este-ano") {
        if (dataTransacao.getFullYear() !== hoje.getFullYear()) return false;
      }
    }

    return true;
  });
}

[seletorPeriodo, seletorTipo, seletorCategoria].forEach(function (seletor) {
  seletor.addEventListener("change", renderizarTransacoes);
});

// ---------- RENDERIZAR LISTA ----------

function renderizarTransacoes() {

  listaTransacoes.innerHTML = "";

  const formatadorMoeda = Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moedaAtual
  });

  const itens = transacoesFiltradas();

  listaEmpty.classList.toggle("visivel", itens.length === 0);

  // ordena por data, mais recente primeiro
  const itensOrdenados = itens.slice().sort(function (a, b) {
    return new Date(b.data) - new Date(a.data);
  });

  itensOrdenados.forEach(function (transacao) {

    const linha = document.createElement("div");
    linha.classList.add("linha-transacao");

    const data = document.createElement("span");
    data.classList.add("data");
    data.textContent = new Date(transacao.data + "T00:00:00").toLocaleDateString("pt-BR");

    const descricao = document.createElement("span");
    descricao.textContent = transacao.descricao;

    const categoria = document.createElement("span");
    categoria.classList.add("tag-categoria");
    categoria.textContent = nomesCategorias[transacao.categoria] || transacao.categoria;

    const tipo = document.createElement("span");
    tipo.classList.add("tag-tipo", transacao.tipo);
    tipo.textContent = transacao.tipo === "receita" ? "Receita" : "Despesa";

    const valor = document.createElement("span");
    valor.classList.add("valor", transacao.tipo);
    valor.textContent = formatadorMoeda.format(transacao.valor);

    const acoes = document.createElement("div");
    acoes.classList.add("acoes-transacao");

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.classList.add("editar");
    btnEditar.innerHTML = '<i class="ti ti-edit"></i>';
    btnEditar.addEventListener("click", function () {
      editarTransacao(transacao.id);
    });

    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.classList.add("excluir");
    btnExcluir.innerHTML = '<i class="ti ti-trash"></i>';
    btnExcluir.addEventListener("click", function () {
      excluirTransacao(transacao.id);
    });

    acoes.appendChild(btnEditar);
    acoes.appendChild(btnExcluir);

    linha.appendChild(data);
    linha.appendChild(descricao);
    linha.appendChild(categoria);
    linha.appendChild(tipo);
    linha.appendChild(valor);
    linha.appendChild(acoes);

    listaTransacoes.appendChild(linha);

  });

}

// ---------- EDITAR / EXCLUIR ----------

function editarTransacao(id) {

  const transacao = transacoes.find(function (t) {
    return t.id === id;
  });

  if (!transacao) return;

  campoId.value = transacao.id;
  campoDescricao.value = transacao.descricao;
  campoValor.value = transacao.valor;
  campoTipo.value = transacao.tipo;
  campoCategoria.value = transacao.categoria;
  campoData.value = transacao.data;

  modalOverlay.classList.add("aberto");

}

function excluirTransacao(id) {

  const confirmar = confirm("Tem certeza que deseja excluir esta transação?");
  if (!confirmar) return;

  transacoes = transacoes.filter(function (t) {
    return t.id !== id;
  });

  salvarTransacoes();
  renderizarTransacoes();
  atualizarCards();

}

// ---------- CARDS DASHBOARD ----------

const cardReceitas = document.getElementById("receitas");
const cardDespesas = document.getElementById("despesas");
const cardSaldo = document.getElementById("saldo");

const overviewSaldo = document.getElementById("balance");
const overviewReceitas = document.getElementById("revenues");
const overviewDespesas = document.getElementById("expenses");

const pizzaEmpty = document.getElementById("pizza-empty");

function atualizarCards() {

    let totalReceitas = 0;
    let totalDespesas = 0;

    let gastosAlimentacao = 0;
    let gastosTransporte = 0;
    let gastosMoradia = 0;
    let gastosLazer = 0;
    let gastosEducacao = 0;
    let gastosOutros = 0;

    transacoes.forEach(function (transacao) {

        if (transacao.tipo === "receita") {

          totalReceitas += transacao.valor;

        }

        if (transacao.tipo === "despesa") {

            totalDespesas += transacao.valor;

            if (transacao.categoria === "alimentacao") {
                gastosAlimentacao += transacao.valor;
            }

            if (transacao.categoria === "transporte") {
                gastosTransporte += transacao.valor;
            }

            if (transacao.categoria === "moradia") {
                gastosMoradia += transacao.valor;
            }

            if (transacao.categoria === "lazer") {
                gastosLazer += transacao.valor;
            }

            if (transacao.categoria === "educacao") {
                gastosEducacao += transacao.valor;
            }

            if (transacao.categoria === "outros") {
                gastosOutros += transacao.valor;
            }

        }

    });

    const formatadorMoeda = Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: moedaAtual
    });

    const saldo = totalReceitas - totalDespesas;

    cardReceitas.textContent = formatadorMoeda.format(totalReceitas);
    cardDespesas.textContent = formatadorMoeda.format(totalDespesas);
    cardSaldo.textContent = formatadorMoeda.format(saldo);

    // seção "Visão geral" — mesmos totais, elementos separados
    overviewSaldo.textContent = formatadorMoeda.format(saldo);
    overviewReceitas.textContent = formatadorMoeda.format(totalReceitas);
    overviewDespesas.textContent = formatadorMoeda.format(totalDespesas);

    const totalCategorias = gastosAlimentacao + gastosTransporte + gastosMoradia +
        gastosLazer + gastosEducacao + gastosOutros;

    if (pizzaEmpty) {
      pizzaEmpty.classList.toggle("visivel", totalCategorias === 0);
    }

    if (!grafico) {

        grafico = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Receitas", "Despesas"],
                datasets: [{
                    label: "Valor",
                    data: [totalReceitas, totalDespesas],
                    backgroundColor: ["#4CAF50", "#F44336"]
                }]
            }
        });

    }

    else {

        grafico.data.datasets[0].data = [totalReceitas, totalDespesas];

        grafico.update();

    }


    if (!graficoCategoria) {

        graficoCategoria = new Chart(ctxCategoria, {
            type: "pie",
            data: {
                labels: [
                    "Alimentação",
                    "Transporte",
                    "Moradia",
                    "Lazer",
                    "Educação",
                    "Outros"
                ],
                datasets: [{
                    label: "Gastos",
                    data: [
                        gastosAlimentacao,
                        gastosTransporte,
                        gastosMoradia,
                        gastosLazer,
                        gastosEducacao,
                        gastosOutros
                    ],
                    backgroundColor: [
                        "#4CAF50",
                        "#2196F3",
                        "#F44336",
                        "#FFC107",
                        "#9C27B0",
                        "#607D8B"
                    ]
                }]
            }
        });

    }

    else {

        graficoCategoria.data.datasets[0].data = [
            gastosAlimentacao,
            gastosTransporte,
            gastosMoradia,
            gastosLazer,
            gastosEducacao,
            gastosOutros
        ];

        graficoCategoria.update();

    }

}



//GRAFICO RECEITAS E DESPESAS//

const ctx = document.getElementById("grafico-barras");

let grafico;


//GRAFICO POR CATEGORIAS//

const ctxCategoria = document.getElementById("grafico-pizza");

let graficoCategoria;


//CONFIGURAÇÕES//

const themeToggle = document.getElementById("theme-toggle");
const themeToggleConfig = document.getElementById("theme-toggle-config");


function alternarTema() {

    if (document.body.getAttribute("data-theme") === "dark") {

        document.body.removeAttribute("data-theme");
        localStorage.setItem("fintrack-tema", "claro");

    }

    else {

        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("fintrack-tema", "escuro");

    }

}

themeToggle.addEventListener("click", alternarTema);
themeToggleConfig.addEventListener("click", alternarTema);

// aplica tema salvo ao carregar a página
if (localStorage.getItem("fintrack-tema") === "escuro") {
  document.body.setAttribute("data-theme", "dark");
}


//ALTERAR MOEDA CONFIG//

const seletorMoeda = document.getElementById("moeda");

let moedaAtual = "BRL";

seletorMoeda.addEventListener("change", function () {

    if (seletorMoeda.value === "real") {
        moedaAtual = "BRL";
    }

    if (seletorMoeda.value === "dolar") {
        moedaAtual = "USD";
    }

    if (seletorMoeda.value === "euro") {
        moedaAtual = "EUR";
    }

    renderizarTransacoes();
    atualizarCards();

});


//LIMPAR TODOS OS DADOS//

const btnLimparDados = document.getElementById("btn-limpar-dados");

btnLimparDados.addEventListener("click", function (event) {

  event.preventDefault();

  const confirmar = confirm("Isso vai apagar todas as transações. Deseja continuar?");
  if (!confirmar) return;

  transacoes = [];
  salvarTransacoes();
  renderizarTransacoes();
  atualizarCards();

});


// ---------- INICIALIZAÇÃO ----------

renderizarTransacoes();
atualizarCards();