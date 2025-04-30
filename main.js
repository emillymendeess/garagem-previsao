// ==================================
// Estado da Aplicação
// ==================================
let garagem = [];
let veiculoAtualPlaca = null;

// ==================================
// Referências de Elementos do DOM
// ==================================
// (Assumidas de ui.js ou declaradas aqui conforme necessário)
const btnVoltarGaragem = document.getElementById('btn-voltar-garagem');
const listaGaragemElement = document.getElementById('lista-garagem');
const formAddVeiculo = document.getElementById('form-add-veiculo');
const formAgendamento = document.getElementById('form-agendamento');
const veiculoTipoSelect = document.getElementById('veiculo-tipo');
const agendamentoPlacaInput = document.getElementById('agendamento-veiculo-placa');
// Novas Referências para Clima
const destinoInput = document.getElementById('destino-viagem');
const verificarClimaBtn = document.getElementById('verificar-clima-btn');
const previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');


// ==================================
// Objetos de Áudio para Interação
// ==================================
// (Código de áudio existente - sem mudanças)
try {
    var somLigar = new Audio("som_ligar.mp3"); // Usando var para escopo de função se não for módulo
    var somDesligar = new Audio("som_desligar.mp3");
    var somBuzina = new Audio("som_buzina.mp3");
    var somAcelerar = new Audio("som_acelerar.mp3");
    var somTurbo = new Audio("som_turbo.mp3");
    var somCarga = new Audio("som_carga.mp3");
} catch (error) {
    console.warn("Não foi possível pré-carregar os objetos de áudio.", error);
    var somLigar = null, somDesligar = null, somBuzina = null, somAcelerar = null, somTurbo = null, somCarga = null;
}


// ==================================
// Funções de API (Simulada Veículo e Real Clima)
// ==================================

/**
 * Busca detalhes adicionais de um veículo em uma fonte de dados externa (simulada).
 * @param {string} placaVeiculo - A placa do veículo a ser buscada.
 * @returns {Promise<object|null>} Promise com dados do veículo ou null.
 */
async function buscarDetalhesVeiculoAPI(placaVeiculo) {
    const apiUrl = './dados_veiculos_api.json';
    try {
        console.log(`Buscando detalhes da API para: ${placaVeiculo}`);
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API Veículo Erro HTTP: ${response.status}`);
        }
        const todosDetalhes = await response.json();
        const detalhes = todosDetalhes.find(item => item && item.placa === placaVeiculo);
        return detalhes || null;
    } catch (error) {
        console.error("Falha na busca de detalhes da API Veículo:", error);
        return null;
    }
}

/**
 * Busca a previsão do tempo atual para uma cidade usando OpenWeatherMap.
 * @param {string} nomeCidade - O nome da cidade para buscar a previsão.
 * @returns {Promise<object|null>} Uma Promise que resolve com os dados da previsão formatados
 *                                  ou null em caso de erro.
 */
async function buscarPrevisaoTempo(nomeCidade) {
    // =======================================================================
    // !!!!!!!!!! ATENÇÃO: NUNCA COLOQUE SUA CHAVE DE API DIRETAMENTE !!!!!!!!!!
    // !!!!!!!!!! NO CÓDIGO FRONTEND EM UMA APLICAÇÃO REAL!         !!!!!!!!!!
    // !!!!!!!!!! ISTO É APENAS PARA FINS DIDÁTICOS NESTE EXERCÍCIO. !!!!!!!!!!
    // =======================================================================
    const apiKey = "SUA_CHAVE_API_AQUI"; // <<< SUBSTITUA PELA SUA CHAVE REAL OBTIDA
    // =======================================================================

    if (apiKey === "SUA_CHAVE_API_AQUI" || !apiKey) {
         console.error("Chave da API OpenWeatherMap não configurada!");
         // Retorna um objeto de erro para ser tratado na UI
         return { error: "Chave da API não configurada no código." };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(nomeCidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            let errorMessage = `Erro HTTP: ${response.status}`;
            try {
                // Tenta obter mensagem de erro da API
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Ignora erro de parse se não houver corpo JSON
            }
            console.error("Erro ao buscar previsão:", errorMessage);
            // Retorna um objeto de erro
            return { error: `Não foi possível buscar a previsão: ${errorMessage}` };
        }

        const data = await response.json();

        // Extrai e formata os dados relevantes
        const previsaoFormatada = {
            cidade: data.name,
            pais: data.sys.country,
            temperatura: data.main.temp,
            sensacaoTermica: data.main.feels_like,
            tempMin: data.main.temp_min,
            tempMax: data.main.temp_max,
            descricao: data.weather[0].description,
            icone: data.weather[0].icon, // Código do ícone
            umidade: data.main.humidity,
            ventoVelocidade: data.wind.speed, // m/s
            // Constrói URL do ícone (exemplo)
            iconeUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        };
        console.log("Previsão recebida:", previsaoFormatada);
        return previsaoFormatada;

    } catch (error) {
        console.error("Erro de rede ou processamento ao buscar previsão:", error);
        return { error: "Falha ao conectar com o serviço de previsão do tempo." };
    }
}


// ==================================
// Funções de Lógica Principal
// ==================================

// --- (Funções encontrarVeiculo, handleAddVeiculo, handleClickDetalhesGaragem, handleAgendarManutencao, verificarAgendamentos existentes - sem mudanças) ---
// ... (Colar as funções de main.js anterior aqui) ...
function encontrarVeiculo(placa) { if (!placa) return undefined; return garagem.find(v => v && v.placa === placa); }
function handleAddVeiculo(event) { event.preventDefault(); const tipo = veiculoTipoSelect.value; const placaInput = document.getElementById('veiculo-placa'); const modeloInput = document.getElementById('veiculo-modelo'); const corInput = document.getElementById('veiculo-cor'); const placa = placaInput.value.trim().toUpperCase(); const modelo = modeloInput.value.trim(); const cor = corInput.value.trim(); if (!placa || !modelo || !cor) { exibirNotificacao("Placa, modelo e cor são obrigatórios.", "error"); return; } if (encontrarVeiculo(placa)) { exibirNotificacao(`A placa ${placa} já está cadastrada na garagem.`, "error"); return; } let novoVeiculo = null; try { switch (tipo) { case 'Carro': const numPortasCarro = document.getElementById('carro-portas').value; novoVeiculo = new Carro(placa, modelo, cor, numPortasCarro); break; case 'CarroEsportivo': const numPortasEsportivo = document.getElementById('carroesportivo-portas').value; novoVeiculo = new CarroEsportivo(placa, modelo, cor, numPortasEsportivo); break; case 'Caminhao': const numEixos = document.getElementById('caminhao-eixos').value; const capacidade = document.getElementById('caminhao-capacidade').value; novoVeiculo = new Caminhao(placa, modelo, cor, numEixos, capacidade); break; default: exibirNotificacao("Tipo de veículo selecionado inválido.", "error"); return; } garagem.push(novoVeiculo); salvarGaragem(garagem); exibirVeiculos(garagem); exibirNotificacao(`${tipo} ${placa} adicionado com sucesso!`, "success"); limparFormulario('form-add-veiculo'); } catch (error) { console.error("Erro ao criar ou adicionar veículo:", error); exibirNotificacao(`Erro ao adicionar veículo: ${error.message}`, "error"); } }
function handleClickDetalhesGaragem(event) { if (event.target.classList.contains('btn-detalhes')) { const placa = event.target.dataset.placa; const veiculo = encontrarVeiculo(placa); if (veiculo) { veiculoAtualPlaca = placa; exibirDetalhesCompletos(veiculo); } else { exibirNotificacao(`Veículo com placa ${placa} não encontrado na garagem.`, "error"); veiculoAtualPlaca = null; } } }
async function handleBuscarDetalhesAPI(event) { if (!event.target.classList.contains('btn-api-details')) return; const placa = event.target.dataset.placa; const apiDetailsSection = document.getElementById('api-details-section'); const apiDetailsContent = document.getElementById('api-details-content'); if (!apiDetailsSection || !apiDetailsContent) { console.error("Elementos da seção de detalhes da API não encontrados."); exibirNotificacao("Erro ao tentar exibir detalhes extras.", "error"); return; } exibirFeedbackLoadingAPI(placa); const detalhes = await buscarDetalhesVeiculoAPI(placa); exibirDetalhesAPI(detalhes, placa); }
function handleAgendarManutencao(event) { event.preventDefault(); const placa = agendamentoPlacaInput.value; const dataInput = document.getElementById('agenda-data'); const tipoInput = document.getElementById('agenda-tipo'); const custoInput = document.getElementById('agenda-custo'); const descricaoInput = document.getElementById('agenda-descricao'); const data = dataInput.value; const tipo = tipoInput.value.trim(); const custoStr = custoInput.value; const descricao = descricaoInput.value.trim(); if (!placa || !data || !tipo || custoStr === '') { exibirNotificacao("Preencha Data, Tipo de Serviço e Custo para agendar.", "error"); return; } const custo = parseFloat(custoStr); if (isNaN(custo) || custo < 0) { exibirNotificacao("O Custo informado é inválido ou negativo.", "error"); return; } const veiculo = encontrarVeiculo(placa); if (!veiculo) { exibirNotificacao(`Veículo com placa ${placa} não encontrado para agendamento.`, "error"); return; } try { const novaManutencao = new Manutencao(new Date(data), tipo, custo, descricao); if (!novaManutencao.validar()) { exibirNotificacao("Dados fornecidos para a manutenção são inválidos.", "error"); return; } if (veiculo.adicionarManutencao(novaManutencao)) { salvarGaragem(garagem); exibirDetalhesCompletos(veiculo); exibirNotificacao(`Manutenção para ${placa} agendada com sucesso!`, "success"); limparFormulario('form-agendamento'); } else { exibirNotificacao("Não foi possível adicionar o agendamento de manutenção.", "error"); } } catch (error) { console.error("Erro ao criar ou agendar manutenção:", error); exibirNotificacao(`Erro ao agendar: ${error.message}`, "error"); } }
function verificarAgendamentos() { const hoje = new Date(); const amanha = new Date(); amanha.setDate(hoje.getDate() + 1); hoje.setHours(0, 0, 0, 0); amanha.setHours(0, 0, 0, 0); garagem.forEach(veiculo => { (veiculo.historicoManutencao || []).forEach(manutencao => { const dataManutencao = new Date(manutencao.data); dataManutencao.setHours(0, 0, 0, 0); if (dataManutencao.getTime() === hoje.getTime()) { exibirNotificacao(`Lembrete HOJE: ${manutencao.formatar()} p/ ${veiculo.placa}`, 'warning', 10000); } else if (dataManutencao.getTime() === amanha.getTime()) { exibirNotificacao(`Lembrete AMANHÃ: ${manutencao.formatar()} p/ ${veiculo.placa}`, 'info', 10000); } }); }); }


/**
 * Manipulador para o clique no botão "Verificar Clima". - NOVO
 * Busca e exibe a previsão do tempo para a cidade digitada.
 */
async function handleVerificarClima() {
    if (!destinoInput || !previsaoResultadoDiv) {
        console.error("Elementos de input/output do clima não encontrados.");
        return;
    }
    const nomeCidade = destinoInput.value.trim();

    if (!nomeCidade) {
        exibirNotificacao("Por favor, digite o nome da cidade de destino.", "warning");
        previsaoResultadoDiv.innerHTML = '<p style="color: orange;">Digite uma cidade.</p>'; // Feedback visual
        return;
    }

    // Exibe estado de carregamento
    previsaoResultadoDiv.innerHTML = `<p>Buscando previsão para ${nomeCidade}...</p>`;

    // Chama a função da API de clima
    const previsao = await buscarPrevisaoTempo(nomeCidade);

    // Exibe o resultado ou o erro retornado pela função da API
    exibirResultadoPrevisao(previsao); // Chama função da UI
}


// ==================================
// Funções de Interação com Veículo
// ==================================
// --- (Função handleInteracao existente - sem mudanças) ---
function handleInteracao(acao) { if (!veiculoAtualPlaca) { exibirNotificacao("Nenhum veículo selecionado para interação.", "warning"); return; } const veiculo = encontrarVeiculo(veiculoAtualPlaca); if (!veiculo) { exibirNotificacao("Erro interno: Veículo selecionado não encontrado.", "error"); veiculoAtualPlaca = null; mostrarGaragemView(); return; } let resultado = ""; let somParaTocar = null; try { switch (acao) { case 'ligar': resultado = veiculo.ligar(); if (resultado.includes("ligado!")) somParaTocar = somLigar; break; case 'desligar': resultado = veiculo.desligar(); if (resultado.includes("desligado!")) somParaTocar = somDesligar; break; case 'acelerar': resultado = veiculo.acelerar(); break; case 'frear': resultado = veiculo.frear(); break; case 'buzinar': resultado = veiculo.buzinar(); somParaTocar = somBuzina; break; case 'turbo': if (veiculo instanceof CarroEsportivo) { resultado = veiculo.turboAtivado ? veiculo.desativarTurbo() : veiculo.ativarTurbo(); if (resultado.includes("ativado!")) somParaTocar = somTurbo; } else { resultado = "Esta ação só é aplicável a Carros Esportivos."; } break; case 'carregar': if (veiculo instanceof Caminhao) { resultado = veiculo.carregar(1000); if (resultado.includes("carregado")) somParaTocar = somCarga; } else { resultado = "Esta ação só é aplicável a Caminhões."; } break; case 'descarregar': if (veiculo instanceof Caminhao) { resultado = veiculo.descarregar(500); if (resultado.includes("descarregado")) somParaTocar = somCarga; } else { resultado = "Esta ação só é aplicável a Caminhões."; } break; default: console.warn("Ação de interação desconhecida:", acao); resultado = "Ação desconhecida."; } let tipoNotificacao = 'info'; if (resultado.includes("Erro") || resultado.includes("não aplicável") || resultado.includes("Pare o veículo") || resultado.includes("excedida") || resultado.includes("Não há carga")) { tipoNotificacao = 'warning'; } else if (resultado.includes("sucesso") || resultado.includes("ligado!") || resultado.includes("desligado!") || resultado.includes("ativado!")) { tipoNotificacao = 'info'; } exibirNotificacao(resultado, tipoNotificacao); if (somParaTocar && typeof somParaTocar.play === 'function') { somParaTocar.currentTime = 0; somParaTocar.play().catch(e => console.warn(`Erro ao tocar o som para a ação ${acao}:`, e)); } atualizarDetalhesInteracao(veiculo); salvarGaragem(garagem); } catch (error) { console.error(`Erro durante a execução da ação '${acao}' no veículo ${veiculoAtualPlaca}:`, error); exibirNotificacao(`Erro inesperado ao tentar '${acao}'. Verifique o console.`, "error"); } }


// ==================================
// Inicialização e Event Listeners
// ==================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM carregado. Inicializando Garagem Inteligente...");

    garagem = carregarGaragem();
    exibirVeiculos(garagem);

    // --- Listeners Formulários ---
    if (formAddVeiculo) formAddVeiculo.addEventListener('submit', handleAddVeiculo);
    else console.error("Form 'form-add-veiculo' não encontrado.");
    if (formAgendamento) formAgendamento.addEventListener('submit', handleAgendarManutencao);
    else console.error("Form 'form-agendamento' não encontrado.");

    // --- Listener Lista Garagem (Delegação) ---
    if (listaGaragemElement) {
        listaGaragemElement.addEventListener('click', (event) => {
             if (event.target.classList.contains('btn-detalhes')) handleClickDetalhesGaragem(event);
             else if (event.target.classList.contains('btn-api-details')) handleBuscarDetalhesAPI(event);
         });
    } else console.error("Elemento 'lista-garagem' não encontrado.");

    // --- Listener Botão Voltar ---
    if (btnVoltarGaragem) {
        btnVoltarGaragem.addEventListener('click', () => {
            veiculoAtualPlaca = null;
            mostrarGaragemView();
            const apiSection = document.getElementById('api-details-section'); // Esconde API Details também
            if (apiSection) apiSection.style.display = 'none';
        });
    } else console.error("Botão 'btn-voltar-garagem' não encontrado.");

    // --- Listener Botão Fechar API Details ---
    const btnCloseApi = document.getElementById('btn-close-api-details');
    const apiSection = document.getElementById('api-details-section');
    if (btnCloseApi && apiSection) {
        btnCloseApi.addEventListener('click', () => apiSection.style.display = 'none');
    } else console.warn("Botão/Seção de fechar API details não encontrados.");

    // --- Listeners Botões Interação ---
    const botoesInteracao = [ { id: 'btn-detail-ligar', acao: 'ligar' }, { id: 'btn-detail-desligar', acao: 'desligar' }, { id: 'btn-detail-acelerar', acao: 'acelerar' }, { id: 'btn-detail-frear', acao: 'frear' }, { id: 'btn-detail-buzinar', acao: 'buzinar' }, { id: 'btn-detail-turbo', acao: 'turbo' }, { id: 'btn-detail-carregar', acao: 'carregar' }, { id: 'btn-detail-descarregar', acao: 'descarregar' }, ];
    botoesInteracao.forEach(item => { const btn = document.getElementById(item.id); if (btn) btn.addEventListener('click', () => handleInteracao(item.acao)); else console.warn(`Botão de interação '${item.id}' não encontrado.`); });

    // --- Listener Select Tipo Veículo ---
    if (veiculoTipoSelect) { veiculoTipoSelect.addEventListener('change', atualizarCamposEspecificos); atualizarCamposEspecificos(); }
    else console.error("Select 'veiculo-tipo' não encontrado.");

    // --- Listener Botão Verificar Clima --- NOVO
    if (verificarClimaBtn) {
        verificarClimaBtn.addEventListener('click', handleVerificarClima);
    } else {
        console.error("Botão 'verificar-clima-btn' não encontrado.");
    }

    // --- Verificação Inicial Agendamentos ---
    verificarAgendamentos();

    console.log("Garagem Inteligente Unificada inicializada com sucesso.");
});