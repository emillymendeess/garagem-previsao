/**
 * Representa um veículo genérico na garagem.
 */
class Veiculo {
    /**
     * Cria uma instância de Veiculo.
     * @param {string} placa - A placa do veículo (identificador único).
     * @param {string} modelo - O modelo do veículo.
     * @param {string} cor - A cor do veículo.
     * @throws {Error} Se placa, modelo ou cor não forem fornecidos.
     */
    constructor(placa, modelo, cor) {
        if (!placa || !modelo || !cor) {
            throw new Error("Placa, modelo e cor são obrigatórios para criar um veículo.");
        }
        this.placa = placa;
        this.modelo = modelo;
        this.cor = cor;
        this.historicoManutencao = []; // Array para guardar objetos Manutencao

        // Propriedades de Interação
        this.ligado = false;
        this.velocidade = 0;

        // Status descritivo do veículo
        this.status = "Na Garagem"; // Estado inicial

        this._tipoVeiculo = 'Veiculo'; // Identificador interno para reconstrução/tipo
    }

    // --- Métodos de Manutenção ---

    /**
     * Adiciona um registro de manutenção ao histórico do veículo.
     * @param {Manutencao} manutencao - O objeto Manutencao a ser adicionado.
     * @returns {boolean} True se a manutenção foi adicionada com sucesso, false caso contrário.
     */
    adicionarManutencao(manutencao) {
        // Assumindo que a classe Manutencao e seu método validar() existem em outro lugar
        if (manutencao instanceof Manutencao && manutencao.validar()) {
            this.historicoManutencao.push(manutencao);
            // Ordena para que a manutenção mais recente apareça primeiro
            this.historicoManutencao.sort((a, b) => b.data - a.data);
            return true;
        }
        console.error("Tentativa de adicionar manutenção inválida:", manutencao);
        return false;
    }

    /**
     * Retorna o histórico de manutenção formatado.
     * @returns {string[]} Array de strings, cada uma representando uma manutenção formatada.
     */
    obterHistoricoFormatado() {
        // Assumindo que Manutencao tem um método formatar()
        return this.historicoManutencao.map(manutencao => manutencao.formatar());
    }

    // --- Métodos de Interação ---

    /**
     * Liga o veículo.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    ligar() {
        if (this.ligado) {
            return "O veículo já está ligado.";
        }
        this.ligado = true;
        this.status = "Ligado (Parado)"; // Atualiza status
        return "Veículo ligado!";
    }

    /**
     * Desliga o veículo.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    desligar() {
        if (!this.ligado) {
            return "O veículo já está desligado.";
        }
        if (this.velocidade > 0) {
            return "Pare o veículo antes de desligar!";
        }
        this.ligado = false;
        this.velocidade = 0; // Garante que a velocidade seja 0 ao desligar
        this.status = "Na Garagem"; // Volta status padrão
        return "Veículo desligado!";
    }

    /**
     * Acelera o veículo.
     * @param {number} [incremento=10] - O quanto aumentar a velocidade (km/h).
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    acelerar(incremento = 10) {
        if (!this.ligado) {
            return "Ligue o veículo primeiro!";
        }
        // Garante que o incremento seja um número positivo
        const aumento = Math.max(0, incremento);
        this.velocidade += aumento;
        this.status = `Em movimento (${this.velocidade} km/h)`; // Corrigido template literal
        return `Acelerando para ${this.velocidade} km/h`; // Corrigido template literal
    }

    /**
     * Freia o veículo.
     * @param {number} [decremento=10] - O quanto diminuir a velocidade (km/h).
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    frear(decremento = 10) {
        if (!this.ligado) {
            return "O veículo está desligado."; // Retorna mensagem consistente
        }
        if (this.velocidade <= 0) {
            this.velocidade = 0; // Garante que não fique negativo
            this.status = "Ligado (Parado)";
            return "O veículo já está parado.";
        }
        // Garante que o decremento seja um número positivo
        const reducao = Math.max(0, decremento);
        this.velocidade = Math.max(0, this.velocidade - reducao); // Não deixa velocidade ficar negativa

        this.status = this.velocidade > 0 ? `Freando (${this.velocidade} km/h)` : "Ligado (Parado)"; // Corrigido template literal e status
        return `Freando para ${this.velocidade} km/h`; // Corrigido template literal
    }

    /**
     * Simula a buzina do veículo.
     * @returns {string} Som da buzina.
     */
    buzinar() {
        // Só pode buzinar se estiver ligado (opcional, mas faz sentido)
        // if (!this.ligado) {
        //     return "Ligue o veículo para buzinar!";
        // }
        return "Beep beep!";
    }

    // --- Método de Informação ---

    /**
     * Retorna informações sobre o veículo.
     * @param {boolean} [completo=true] - Se deve incluir detalhes de status e interação.
     * @returns {string} String formatada com as informações do veículo.
     */
    getInfo(completo = true) {
        let info = `Placa: ${this.placa}, Modelo: ${this.modelo}, Cor: ${this.cor}`; // Corrigido template literal
        if (completo) {
            // Adiciona informações de estado e interação se solicitado
            info += `, Status: ${this.status}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade} km/h`; // Corrigido template literal
        }
        return info;
    }
}

/**
 * Representa um Carro, herdando de Veiculo.
 */
class Carro extends Veiculo {
    /**
     * Cria uma instância de Carro.
     * @param {string} placa - A placa do veículo.
     * @param {string} modelo - O modelo do veículo.
     * @param {string} cor - A cor do veículo.
     * @param {number} [numPortas=4] - O número de portas do carro.
     */
    constructor(placa, modelo, cor, numPortas = 4) {
        super(placa, modelo, cor); // Chama o construtor da classe pai
        this.numPortas = parseInt(numPortas, 10) || 4; // Garante que seja um inteiro, fallback para 4
        this._tipoVeiculo = 'Carro'; // Sobrescreve o tipo
    }

    /**
     * Retorna informações sobre o carro, incluindo o número de portas.
     * @param {boolean} [completo=true] - Se deve incluir detalhes de status e interação.
     * @returns {string} String formatada com as informações do carro.
     */
    getInfo(completo = true) {
        let info = super.getInfo(completo); // Obtém informações da classe pai
        // Adiciona a informação específica do Carro
        info += `, Portas: ${this.numPortas}`; // Corrigido template literal (removido if desnecessário se sempre adiciona)
        return info;
    }
}

/**
 * Representa um Carro Esportivo, herdando de Carro.
 */
class CarroEsportivo extends Carro {
    /**
     * Cria uma instância de CarroEsportivo.
     * @param {string} placa - A placa do veículo.
     * @param {string} modelo - O modelo do veículo.
     * @param {string} cor - A cor do veículo.
     * @param {number} [numPortas=2] - O número de portas (padrão 2 para esportivos).
     */
    constructor(placa, modelo, cor, numPortas = 2) {
        super(placa, modelo, cor, numPortas); // Chama o construtor de Carro
        this.turboAtivado = false; // Estado inicial do turbo
        this._tipoVeiculo = 'CarroEsportivo'; // Sobrescreve o tipo
    }

    /**
     * Ativa o turbo do carro esportivo.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    ativarTurbo() {
        if (!this.ligado) {
            return "Ligue o carro primeiro!";
        }
        if (this.turboAtivado) {
            return "Turbo já está ativado!";
        }
        this.turboAtivado = true;
        // Atualiza o status para refletir o turbo (opcional)
        // this.status += " [TURBO]";
        return "Turbo ativado! VRUUUM!";
    }

    /**
     * Desativa o turbo do carro esportivo.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    desativarTurbo() {
        if (!this.turboAtivado) {
            return "Turbo já está desativado.";
        }
        this.turboAtivado = false;
        // Remove a indicação de turbo do status (se foi adicionada)
        // this.status = this.status.replace(" [TURBO]", "");
        return "Turbo desativado.";
    }

    /**
     * Acelera o carro esportivo, com bônus se o turbo estiver ativado.
     * @param {number} [incremento=10] - O quanto aumentar a velocidade base (km/h).
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    acelerar(incremento = 10) {
        if (!this.ligado) {
            return "Ligue o veículo primeiro!";
        }
        // Garante que o incremento seja um número positivo
        const aumentoBase = Math.max(0, incremento);
        // Dobra a aceleração se o turbo estiver ativo
        const aceleracaoFinal = this.turboAtivado ? aumentoBase * 2 : aumentoBase;

        this.velocidade += aceleracaoFinal;
        // Atualiza o status incluindo a indicação de turbo se ativo
        this.status = `Em movimento (${this.velocidade} km/h)${this.turboAtivado ? ' [TURBO]' : ''}`; // Corrigido template literal
        // Retorna mensagem indicando se o turbo foi usado
        return `Acelerando para ${this.velocidade} km/h${this.turboAtivado ? ' com TURBO!' : ''}`; // Corrigido template literal
    }

    /**
     * Retorna informações sobre o carro esportivo, incluindo o estado do turbo.
     * @param {boolean} [completo=true] - Se deve incluir detalhes de status e interação.
     * @returns {string} String formatada com as informações do carro esportivo.
     */
    getInfo(completo = true) {
        let info = super.getInfo(completo); // Obtém informações de Carro
        // Adiciona a informação específica do CarroEsportivo
        info += `, Turbo: ${this.turboAtivado ? "Ativado" : "Desativado"}`; // Corrigido template literal
        return info;
    }
}

/**
 * Representa um Caminhão, herdando de Veiculo.
 */
class Caminhao extends Veiculo {
    /**
     * Cria uma instância de Caminhao.
     * @param {string} placa - A placa do veículo.
     * @param {string} modelo - O modelo do veículo.
     * @param {string} cor - A cor do veículo.
     * @param {number} [numEixos=2] - O número de eixos do caminhão.
     * @param {number} [capacidadeCarga=5000] - A capacidade máxima de carga em kg.
     */
    constructor(placa, modelo, cor, numEixos = 2, capacidadeCarga = 5000) {
        super(placa, modelo, cor); // Chama o construtor de Veiculo
        this.numEixos = parseInt(numEixos, 10) || 2; // Garante inteiro, fallback 2
        this.capacidadeCarga = parseFloat(capacidadeCarga) || 0; // Permite decimal, fallback 0
        this.cargaAtual = 0; // Carga inicial é zero
        this._tipoVeiculo = 'Caminhao'; // Sobrescreve o tipo
    }

    /**
     * Carrega o caminhão com uma quantidade de carga.
     * @param {number} quantidade - A quantidade de carga a adicionar (em kg).
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    carregar(quantidade) {
        if (this.ligado) {
            return "Desligue o caminhão para carregar/descarregar com segurança.";
        }
        // Garante que a quantidade seja um número não negativo
        const cargaAdicionar = Math.max(0, parseFloat(quantidade) || 0);

        if (this.cargaAtual + cargaAdicionar <= this.capacidadeCarga) {
            this.cargaAtual += cargaAdicionar;
            // Atualiza status se desejar (ex: "Parado [Carregado]")
            return `Caminhão carregado (+${cargaAdicionar}kg). Carga atual: ${this.cargaAtual}kg / ${this.capacidadeCarga}kg`; // Corrigido template literal
        } else {
            const podeCarregar = this.capacidadeCarga - this.cargaAtual;
            return `Capacidade de carga excedida! Só pode carregar mais ${podeCarregar}kg.`; // Corrigido template literal
        }
    }

    /**
     * Descarrega uma quantidade de carga do caminhão.
     * @param {number} quantidade - A quantidade de carga a remover (em kg).
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    descarregar(quantidade) {
        if (this.ligado) {
            return "Desligue o caminhão para carregar/descarregar com segurança.";
        }
        // Garante que a quantidade seja um número não negativo
        const cargaRemover = Math.max(0, parseFloat(quantidade) || 0);

        if (this.cargaAtual - cargaRemover >= 0) {
            this.cargaAtual -= cargaRemover;
            // Atualiza status se desejar
            return `Caminhão descarregado (-${cargaRemover}kg). Carga atual: ${this.cargaAtual}kg`; // Corrigido template literal
        } else {
            const podeDescarregar = this.cargaAtual;
            return `Não há carga suficiente para descarregar ${cargaRemover}kg. Carga atual: ${podeDescarregar}kg.`; // Corrigido template literal e ponto final
        }
    }

    /**
     * Acelera o caminhão, considerando o peso da carga.
     * @param {number} [incremento=10] - O quanto aumentar a velocidade base (km/h).
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    acelerar(incremento = 10) {
        if (!this.ligado) {
            return "Ligue o veículo primeiro!";
        }
        // Garante que o incremento seja um número positivo
        const aumentoBase = Math.max(0, incremento);

        // Reduz aceleração baseado na % de carga (exemplo simples)
        // Garante que capacidadeCarga não seja 0 para evitar divisão por zero
        const percentualCarga = this.capacidadeCarga > 0 ? this.cargaAtual / this.capacidadeCarga : 0;
        // Fator de redução: mínimo 30% da aceleração, máximo 100% (sem carga)
        const fatorCarga = Math.max(0.3, 1 - (percentualCarga * 0.7));
        const aceleracaoReal = Math.round(aumentoBase * fatorCarga);

        this.velocidade += aceleracaoReal;
        this.status = `Em movimento (${this.velocidade} km/h) [Carga: ${this.cargaAtual}kg]`; // Corrigido template literal
        return `Acelerando para ${this.velocidade} km/h (afetado pela carga)`; // Corrigido template literal
        // A linha abaixo parece ser um artefato e foi removida
        // IGNORE_WHEN_COPYING_START content_copydownload Use code with caution. IGNORE_WHEN_COPYING_END
    }

    /**
     * Retorna informações sobre o caminhão, incluindo eixos e carga.
     * @param {boolean} [completo=true] - Se deve incluir detalhes de status e interação.
     * @returns {string} String formatada com as informações do caminhão.
     */
    getInfo(completo = true) {
        let info = super.getInfo(completo); // Obtém informações de Veiculo
        // Adiciona informações específicas do Caminhao
        info += `, Eixos: ${this.numEixos}, Carga: ${this.cargaAtual}kg / ${this.capacidadeCarga}kg`; // Corrigido template literal
        return info;
    }
}