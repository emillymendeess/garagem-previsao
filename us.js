// ==================================
// Referências de Elementos do DOM
// ==================================
// (Referências existentes - sem mudanças)
const garagemSection = document.getElementById('garage-section');
const addVehicleSection = document.getElementById('add-vehicle-section');
const detalhesSection = document.getElementById('detalhes-veiculo-section');
const listaGaragemElement = document.getElementById('lista-garagem');
const detalhesTituloElement = document.getElementById('detalhes-veiculo-titulo');
const listaHistoricoElement = document.getElementById('lista-historico');
const listaAgendamentosElement = document.getElementById('lista-agendamentos');
const formAddVeiculo = document.getElementById('form-add-veiculo');
const veiculoTipoSelect = document.getElementById('veiculo-tipo');
const formAgendamento = document.getElementById('form-agendamento');
const agendamentoPlacaInput = document.getElementById('agendamento-veiculo-placa');
const detalhesStatusElement = document.getElementById('detalhes-veiculo-status');
const detalhesBotoesContainer = document.getElementById('detalhes-veiculo-botoes');
const detalhesImagemElement = document.getElementById('detalhes-veiculo-imagem');
const notificacoesContainer = document.getElementById('notificacoes-container');
const apiDetailsSection = document.getElementById('api-details-section');
const apiDetailsContent = document.getElementById('api-details-content');
// Novas Referências para Clima
const previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');


// ==================================
// Funções de Exibição e UI
// ==================================

// --- (Funções exibirVeiculos, atualizarDetalhesInteracao, exibirDetalhesCompletos, mostrarGaragemView, exibirNotificacao, limparFormulario, atualizarCamposEspecificos, exibirFeedbackLoadingAPI, exibirDetalhesAPI existentes - sem mudanças) ---
// ... (Colar as funções de ui.js anterior aqui) ...
function exibirVeiculos(veiculos) { if (!listaGaragemElement) { console.error("Elemento 'lista-garagem' não encontrado para exibir veículos."); return; } listaGaragemElement.innerHTML = ''; if (!veiculos || veiculos.length === 0) { listaGaragemElement.innerHTML = '<p>Nenhum veículo na garagem.</p>'; return; } veiculos.forEach(veiculo => { const li = document.createElement('li'); li.classList.add('veiculo-list-item'); li.classList.add(`veiculo-${veiculo._tipoVeiculo.toLowerCase()}`); const infoDiv = document.createElement('div'); infoDiv.classList.add('veiculo-info'); infoDiv.innerHTML = `<p><strong>${veiculo.placa}</strong> - ${veiculo.modelo} (${veiculo.cor}) - <em>${veiculo.status || 'Status Desconhecido'}</em></p>`; const actionsDiv = document.createElement('div'); actionsDiv.classList.add('veiculo-actions'); actionsDiv.innerHTML = ` <button class="btn btn-success btn-sm btn-detalhes" data-placa="${veiculo.placa}"> Detalhes / Interagir </button> <button class="btn btn-info btn-sm btn-api-details" data-placa="${veiculo.placa}"> Info Extra (API) </button> `; li.appendChild(infoDiv); li.appendChild(actionsDiv); listaGaragemElement.appendChild(li); }); }
function atualizarDetalhesInteracao(veiculo) { if (!veiculo) { if(detalhesStatusElement) detalhesStatusElement.textContent = 'Erro: Veículo não encontrado para interação.'; if(detalhesBotoesContainer) detalhesBotoesContainer.innerHTML = ''; return; } if(!detalhesStatusElement || !detalhesBotoesContainer) return; detalhesStatusElement.textContent = veiculo.getInfo(true); const btnLigar = document.getElementById('btn-detail-ligar'); const btnDesligar = document.getElementById('btn-detail-desligar'); const btnAcelerar = document.getElementById('btn-detail-acelerar'); const btnFrear = document.getElementById('btn-detail-frear'); const btnBuzinar = document.getElementById('btn-detail-buzinar'); const btnTurbo = document.getElementById('btn-detail-turbo'); const btnCarregar = document.getElementById('btn-detail-carregar'); const btnDescarregar = document.getElementById('btn-detail-descarregar'); if (!btnLigar || !btnDesligar || !btnAcelerar || !btnFrear || !btnBuzinar || !btnTurbo || !btnCarregar || !btnDescarregar) { console.error("Um ou mais botões de interação não foram encontrados no DOM."); detalhesStatusElement.textContent += " (Erro: Botões de interação faltando)"; return; } btnTurbo.style.display = (veiculo instanceof CarroEsportivo) ? 'inline-block' : 'none'; btnCarregar.style.display = (veiculo instanceof Caminhao) ? 'inline-block' : 'none'; btnDescarregar.style.display = (veiculo instanceof Caminhao) ? 'inline-block' : 'none'; btnLigar.disabled = veiculo.ligado; btnDesligar.disabled = !veiculo.ligado || veiculo.velocidade > 0; btnAcelerar.disabled = !veiculo.ligado; btnFrear.disabled = !veiculo.ligado || veiculo.velocidade === 0; btnBuzinar.disabled = !veiculo.ligado; if (veiculo instanceof CarroEsportivo) { btnTurbo.textContent = veiculo.turboAtivado ? 'Desativar Turbo' : 'Ativar Turbo'; } if (detalhesImagemElement) { let imagemSrc = ''; switch (veiculo._tipoVeiculo) { case 'Carro': imagemSrc = 'images/carro.png'; break; case 'CarroEsportivo': imagemSrc = 'images/carroesportivo.png'; break; case 'Caminhao': imagemSrc = 'images/caminhao.png'; break; default: imagemSrc = ''; } if (imagemSrc) { detalhesImagemElement.src = imagemSrc; detalhesImagemElement.alt = `Imagem de um ${veiculo._tipoVeiculo}`; detalhesImagemElement.style.display = 'block'; } else { detalhesImagemElement.style.display = 'none'; } } }
function exibirDetalhesCompletos(veiculo) { if (!veiculo) { console.error("Tentativa de exibir detalhes internos de um veículo inválido."); mostrarGaragemView(); exibirNotificacao("Erro ao carregar detalhes do veículo.", "error"); return; } if(!detalhesSection || !detalhesTituloElement || !agendamentoPlacaInput || !listaHistoricoElement || !listaAgendamentosElement || !garagemSection || !addVehicleSection) { console.error("Elementos essenciais para exibirDetalhesCompletos não encontrados."); return; } detalhesTituloElement.textContent = `Detalhes - ${veiculo.placa} (${veiculo.modelo})`; agendamentoPlacaInput.value = veiculo.placa; atualizarDetalhesInteracao(veiculo); listaHistoricoElement.innerHTML = ''; listaAgendamentosElement.innerHTML = ''; const hoje = new Date(); hoje.setHours(0, 0, 0, 0); let historicoCount = 0; let agendamentoCount = 0; veiculo.historicoManutencao.sort((a, b) => b.data - a.data); veiculo.historicoManutencao.forEach(manutencao => { const li = document.createElement('li'); li.textContent = manutencao.formatar(); const dataManutencao = new Date(manutencao.data); dataManutencao.setHours(0,0,0,0); if (dataManutencao <= hoje) { listaHistoricoElement.appendChild(li); historicoCount++; } else { listaAgendamentosElement.appendChild(li); agendamentoCount++; } }); if (historicoCount === 0) listaHistoricoElement.innerHTML = '<li>Nenhum histórico registrado.</li>'; if (agendamentoCount === 0) listaAgendamentosElement.innerHTML = '<li>Nenhum agendamento futuro.</li>'; detalhesSection.style.display = 'block'; garagemSection.style.display = 'none'; addVehicleSection.style.display = 'none'; if(apiDetailsSection) apiDetailsSection.style.display = 'none'; }
function mostrarGaragemView() { if(detalhesSection) detalhesSection.style.display = 'none'; if(garagemSection) garagemSection.style.display = 'block'; if(addVehicleSection) addVehicleSection.style.display = 'block'; if(apiDetailsSection) apiDetailsSection.style.display = 'none'; }
function exibirNotificacao(mensagem, tipo = 'info', duracao = 4000) { if (!notificacoesContainer) { console.error("Container de notificações não encontrado!"); return; } const notificacao = document.createElement('div'); notificacao.className = `notificacao notificacao-${tipo}`; notificacao.textContent = mensagem; notificacoesContainer.appendChild(notificacao); if (duracao > 0) { setTimeout(() => { notificacao.classList.add('fade-out'); setTimeout(() => { notificacao.remove(); }, 500); }, duracao); } }
function limparFormulario(formId) { const form = document.getElementById(formId); if (form && typeof form.reset === 'function') { form.reset(); if (formId === 'form-add-veiculo') { atualizarCamposEspecificos(); } } else { console.warn(`Formulário com ID '${formId}' não encontrado ou não é um formulário.`); } }
function atualizarCamposEspecificos() { if (!veiculoTipoSelect) return; const tipoSelecionado = veiculoTipoSelect.value; document.querySelectorAll('.campos-especificos').forEach(div => { div.style.display = 'none'; }); const idCampoParaMostrar = `campos-${tipoSelecionado.toLowerCase()}`; const camposParaMostrar = document.getElementById(idCampoParaMostrar); if (camposParaMostrar) { camposParaMostrar.style.display = 'block'; } }
function exibirFeedbackLoadingAPI(placa) { if (!apiDetailsSection || !apiDetailsContent) { console.error("Elementos da seção de detalhes da API não encontrados para loading."); return; } apiDetailsContent.innerHTML = `<p>Buscando detalhes adicionais para ${placa}...</p>`; apiDetailsSection.style.display = 'block'; }
function exibirDetalhesAPI(detalhes, placa) { if (!apiDetailsSection || !apiDetailsContent) { console.error("Elementos da seção de detalhes da API não encontrados para exibição."); return; } apiDetailsContent.innerHTML = ''; if (detalhes) { const valorFIPEFormatado = detalhes.valorFIPE ? `R$ ${detalhes.valorFIPE.toFixed(2).replace('.', ',')}` : 'N/D'; const temRecallTexto = detalhes.temRecall ? `<strong style="color: red;">Sim</strong>` : 'Não'; const recallInfoHtml = detalhes.temRecall && detalhes.recallInfo ? `<p><strong>Informação Recall:</strong> ${detalhes.recallInfo}</p>` : ''; const consumoCidade = detalhes.consumoMedioCidade ? `${detalhes.consumoMedioCidade} km/l` : 'N/D'; const consumoEstrada = detalhes.consumoMedioEstrada ? `${detalhes.consumoMedioEstrada} km/l` : 'N/D'; apiDetailsContent.innerHTML = ` <h4>Detalhes Adicionais para ${placa}</h4> <p><strong>Valor Tabela FIPE (Estimado):</strong> ${valorFIPEFormatado}</p> <p><strong>Consumo Médio (Cidade):</strong> ${consumoCidade}</p> <p><strong>Consumo Médio (Estrada):</strong> ${consumoEstrada}</p> <p><strong>Possui Recall Pendente:</strong> ${temRecallTexto}</p> ${recallInfoHtml} <p><strong>Dica de Manutenção:</strong> ${detalhes.dicaManutencao || 'Nenhuma dica específica.'}</p> <p style="clear: both;"><small><em>Identificador API: ${detalhes.identificadorUnico || 'N/D'}</em></small></p> `; } else { apiDetailsContent.innerHTML = `<p>Não foram encontrados detalhes adicionais para a placa ${placa} na fonte externa ou ocorreu um erro ao buscar os dados.</p>`; } apiDetailsSection.style.display = 'block'; }


/**
 * Exibe o resultado da previsão do tempo na interface. - NOVO
 * @param {object | null} previsao - Objeto com os dados da previsão ou um objeto com a chave 'error'.
 */
function exibirResultadoPrevisao(previsao) {
    if (!previsaoResultadoDiv) {
        console.error("Div de resultado da previsão não encontrado.");
        return;
    }

    previsaoResultadoDiv.innerHTML = ''; // Limpa conteúdo anterior

    if (previsao && previsao.error) {
        // Exibe a mensagem de erro retornada pela função buscarPrevisaoTempo
        previsaoResultadoDiv.innerHTML = `<p style="color: red;">Erro: ${previsao.error}</p>`;
    } else if (previsao) {
        // Constrói o HTML para exibir a previsão formatada
        // Capitaliza a primeira letra da descrição
        const descricaoCapitalizada = previsao.descricao.charAt(0).toUpperCase() + previsao.descricao.slice(1);

        previsaoResultadoDiv.innerHTML = `
            <h4>Clima Atual em ${previsao.cidade}, ${previsao.pais}</h4>
            <div class="weather-details">
                 <img src="${previsao.iconeUrl}" alt="${descricaoCapitalizada}" title="${descricaoCapitalizada}" class="weather-icon">
                 <div class="weather-text">
                     <p><strong>${descricaoCapitalizada}</strong></p>
                     <p>Temperatura: ${previsao.temperatura.toFixed(1)}°C (Sensação: ${previsao.sensacaoTermica.toFixed(1)}°C)</p>
                     <p>Min: ${previsao.tempMin.toFixed(1)}°C / Max: ${previsao.tempMax.toFixed(1)}°C</p>
                     <p>Umidade: ${previsao.umidade}%</p>
                     <p>Vento: ${(previsao.ventoVelocidade * 3.6).toFixed(1)} km/h</p>
                 </div>
            </div>
            <p style="font-size: 0.8em; margin-top: 10px;"><em>Planeje sua viagem de acordo!</em></p>
        `;
    } else {
        // Caso genérico se algo muito inesperado ocorrer (buscarPrevisaoTempo não deveria retornar null sem erro)
        previsaoResultadoDiv.innerHTML = `<p style="color: red;">Ocorreu um erro inesperado ao buscar a previsão.</p>`;
    }
}