// transações JS//

const transacoes = [];

const modalOverlay = document.getElementById("modal-overlay");
const modalForm = document.getElementById("modal-form");

const btnNovaTransacao = document.getElementById("btn-nova-transacao");
const btnCancelar = document.getElementById("modal-cancelar");

const campoDescricao = document.getElementById("campo-descricao");
const campoValor = document.getElementById("campo-valor");
const campoTipo = document.getElementById("campo-tipo");
const campoCategoria = document.getElementById("campo-categoria");
const campoData = document.getElementById("campo-data");

const listaTransacoes = document.getElementById("lista-transacoes");

btnNovaTransacao.addEventListener("click", function () {
  modalOverlay.classList.add("aberto");
});

btnCancelar.addEventListener("click", function () {
  modalOverlay.classList.remove("aberto");
});

modalForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const transacao = {
    descricao: campoDescricao.value,
    valor: parseFloat(campoValor.value),
    tipo: campoTipo.value,
    categoria: campoCategoria.value,
    data: campoData.value
  };

  transacoes.push(transacao);

  renderizarTransacoes();

  atualizarCards();

  modalOverlay.classList.remove("aberto");
  modalForm.reset();

  console.log(transacoes);
});

function renderizarTransacoes() {

  listaTransacoes.innerHTML = "";

  transacoes.forEach(function (transacao) {

    const linha = document.createElement("div");

    linha.classList.add("linha-transacao");

    const descricao = document.createElement("span");

    descricao.textContent = transacao.descricao;

    const valor = document.createElement("span");
    valor.textContent = transacao.valor;

    const tipo = document.createElement("span");
    tipo.textContent = transacao.tipo;

    const categoria = document.createElement("span");
    categoria.textContent = transacao.categoria;

    const data = document.createElement("span");
    data.textContent = transacao.data;

    linha.appendChild(descricao);

    linha.appendChild(valor);

    linha.appendChild(tipo);

    linha.appendChild(categoria);

    linha.appendChild(data);

    listaTransacoes.appendChild(linha);

  });

}

//CARDS DASHBOARD//

const cardReceitas = document.getElementById("receitas");
const cardDespesas = document.getElementById("despesas");
const cardSaldo = document.getElementById("saldo");


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

    cardReceitas.textContent = formatadorMoeda.format(totalReceitas);
    cardDespesas.textContent = formatadorMoeda.format(totalDespesas);
    cardSaldo.textContent = formatadorMoeda.format(totalReceitas - totalDespesas);


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

    }

    else {

        document.body.setAttribute("data-theme", "dark");

    }

}

themeToggle.addEventListener("click", alternarTema);
themeToggleConfig.addEventListener("click", alternarTema);


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

    atualizarCards();

});