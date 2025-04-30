/**
 * Chave usada para armazenar os dados da garagem no LocalStorage.
 * A versão (_v3) indica mudanças na estrutura de dados salva (incluindo interações).
 */
const GARAGEM_STORAGE_KEY = 'garagemInteligenteData_v3';

/**
 * Salva a lista atual de veículos, incluindo seu estado de interação, no LocalStorage.
 *
 * @param {Veiculo[]} veiculos - O array de objetos Veiculo (ou subclasses) a ser salvo.
 */
function salvarGaragem(veiculos) {
    try {
        // Converte o array de veículos (com todas as suas propriedades atuais) para JSON.
        // Propriedades como ligado, velocidade, cargaAtual, turboAtivado são incluídas automaticamente.
        const dataToSave = JSON.stringify(veiculos);
        localStorage.setItem(GARAGEM_STORAGE_KEY, dataToSave);
        // console.log("Garagem salva com sucesso:", dataToSave); // Opcional: para depuração
    } catch (error) {
        console.error("Erro ao salvar dados da garagem no LocalStorage:", error);
        // Exibe uma notificação permanente em caso de erro crítico na gravação.
        // Assume que a função exibirNotificacao existe globalmente.
        exibirNotificacao("Erro crítico ao salvar dados. Verifique o console.", "error", 0);
    }
}

/**
 * Carrega a lista de veículos do LocalStorage.
 * Reconstrói as instâncias das classes corretas (Veiculo, Carro, CarroEsportivo, Caminhao)
 * e restaura o estado de interação e histórico de manutenção salvos.
 *
 * @returns {Veiculo[]} Um array com os objetos Veiculo (e subclasses) reconstruídos,
 *                      ou um array vazio se não houver dados salvos ou ocorrer um erro.
 */
function carregarGaragem() {
    try {
        const dataJSON = localStorage.getItem(GARAGEM_STORAGE_KEY);
        // Se não houver dados salvos, retorna uma garagem vazia.
        if (!dataJSON) {
            return [];
        }

        // Tenta parsear os dados JSON salvos.
        const veiculosPlain = JSON.parse(dataJSON);
        const veiculosReconstruidos = [];

        // Itera sobre cada objeto "simples" recuperado do JSON.
        for (const veiculoPlain of veiculosPlain) {
            // Verifica se o objeto recuperado é válido (mínimo para evitar erros)
            if (!veiculoPlain || !veiculoPlain.placa || !veiculoPlain._tipoVeiculo) {
                console.warn("Item inválido encontrado no LocalStorage, pulando:", veiculoPlain);
                continue; // Pula para o próximo item
            }

            let veiculoReal = null; // Variável para armazenar a instância reconstruída.

            // 1. Reconstrói o histórico de manutenção PRIMEIRO.
            // Assume que a classe Manutencao existe e tem um construtor compatível.
            // Garante que historicoManutencao exista e seja um array antes de mapear.
            const historicoReconstruido = (veiculoPlain.historicoManutencao || []).map(mPlain =>
                new Manutencao(
                    new Date(mPlain.data), // Reconstrói o objeto Date
                    mPlain.tipo,
                    mPlain.custo,
                    mPlain.descricao
                )
            );

            // 2. Cria a instância da classe correta com base no _tipoVeiculo.
            switch (veiculoPlain._tipoVeiculo) {
                case 'Carro':
                    veiculoReal = new Carro(
                        veiculoPlain.placa,
                        veiculoPlain.modelo,
                        veiculoPlain.cor,
                        veiculoPlain.numPortas // Passa o valor salvo
                    );
                    break;
                case 'CarroEsportivo':
                    veiculoReal = new CarroEsportivo(
                        veiculoPlain.placa,
                        veiculoPlain.modelo,
                        veiculoPlain.cor,
                        veiculoPlain.numPortas // Passa o valor salvo
                    );
                    // Restaura estado específico do CarroEsportivo
                    veiculoReal.turboAtivado = veiculoPlain.turboAtivado || false;
                    break;
                case 'Caminhao':
                    veiculoReal = new Caminhao(
                        veiculoPlain.placa,
                        veiculoPlain.modelo,
                        veiculoPlain.cor,
                        veiculoPlain.numEixos, // Passa o valor salvo
                        veiculoPlain.capacidadeCarga // Passa o valor salvo
                    );
                    // Restaura estado específico do Caminhao
                    veiculoReal.cargaAtual = veiculoPlain.cargaAtual || 0;
                    break;
                case 'Veiculo': // Caso explícito para Veiculo base
                    veiculoReal = new Veiculo(
                        veiculoPlain.placa,
                        veiculoPlain.modelo,
                        veiculoPlain.cor
                    );
                    break;
                default:
                    // Se o tipo for desconhecido, registra um aviso e cria como Veiculo base.
                    console.warn(`Tipo de veículo desconhecido ou não tratado: '${veiculoPlain._tipoVeiculo}'. Criando como Veiculo base.`);
                    veiculoReal = new Veiculo(
                        veiculoPlain.placa,
                        veiculoPlain.modelo,
                        veiculoPlain.cor
                    );
                    // Define o tipo original para possível depuração, se necessário
                    // veiculoReal._tipoOriginalDesconhecido = veiculoPlain._tipoVeiculo;
                    break;
            }

            // 3. Atribui propriedades comuns e o histórico reconstruído à instância.
            if (veiculoReal) {
                veiculoReal.historicoManutencao = historicoReconstruido;

                // Restaura propriedades de interação comuns
                veiculoReal.ligado = veiculoPlain.ligado || false;
                veiculoReal.velocidade = veiculoPlain.velocidade || 0;

                // Restaura o status. Se não houver status salvo, tenta inferir um padrão.
                veiculoReal.status = veiculoPlain.status ||
                                     (veiculoReal.ligado ? (veiculoReal.velocidade > 0 ? `Em movimento (${veiculoReal.velocidade} km/h)`: "Ligado (Parado)") : "Na Garagem");

                veiculosReconstruidos.push(veiculoReal);
            }
        }
        // console.log("Garagem carregada com sucesso:", veiculosReconstruidos); // Opcional: para depuração
        return veiculosReconstruidos;

        // A linha abaixo parece ser um artefato e foi removida.
        // IGNORE_WHEN_COPYING_START content_copydownload Use code with caution. IGNORE_WHEN_COPYING_END

    } catch (error) {
        console.error("Erro crítico ao carregar ou parsear dados da garagem:", error);
        // Exibe notificação e limpa dados potencialmente corrompidos do LocalStorage.
        exibirNotificacao("Erro ao carregar dados salvos. A garagem foi resetada.", "error");
        localStorage.removeItem(GARAGEM_STORAGE_KEY);
        return []; // Retorna garagem vazia em caso de erro grave.
    }
}