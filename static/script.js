function atualizarFront(data, cardapioPanel) {
    console.log('Atualizando front...');
    const dias_da_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const data_atual_formatada = `${(data.getDate()+1).toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
    const dia_semana_atual = dias_da_semana[data.getDay()];


    const diurnoButton = document.getElementById('diurno');
    // Verifica se o botão Diurno está selecionado
    if (diurnoButton.classList.contains('active')) {
        diurno = true;
    } else {
        diurno = false;
    }

    fetch('static/cardapio.txt')
        .then(response => response.text())
        .then(text => {
            let blocoAtual = '';
            let blocoEncontrado = false;

            const blocos = text.split('Dia da Semana:');
            for (const bloco of blocos) {
                for (const linha of bloco.split('\n')) {
                    if (linha.includes('Data: ' + data_atual_formatada)) {
                        blocoEncontrado = true;
                    }

                    if (blocoEncontrado) {
                        blocoAtual += linha + '\n';
                        complementoJantar = '';
                        carneJantar = '';
                        if (linha.trim() === '') {
                            const linhasBloco = blocoAtual.split('\n');
                            for (const linhaBloco of linhasBloco) {
                                if (linhaBloco.includes("Carne: ")) {
                                    cardapioPanel.carnePlaceholder.textContent = 'Carregando...';
                                    carne = linhaBloco.substring(7);
                                } else if (linhaBloco.includes("Carne jantar: ")) {
                                    cardapioPanel.carnePlaceholder.textContent = 'Carregando...';
                                    carneJantar = linhaBloco.substring(14);
                                } else if (linhaBloco.includes("Complemento: ")) {
                                    cardapioPanel.complementoPlaceholder.textContent = 'Carregando...';
                                    complemento = linhaBloco.substring(13);
                                } else if (linhaBloco.includes("Complemento jantar: ")) {
                                    cardapioPanel.complementoPlaceholder.textContent = 'Carregando...';
                                    complementoJantar = linhaBloco.substring(20);
                                } else if (linhaBloco.includes("Salada 1: ")) {
                                    cardapioPanel.salada1Placeholder.textContent = 'Carregando...';
                                    salada1 = linhaBloco.substring(10);
                                } else if (linhaBloco.includes("Salada 2: ")) {
                                    cardapioPanel.salada2Placeholder.textContent = 'Carregando...';
                                    salada2 = linhaBloco.substring(10);
                                } else if (linhaBloco.includes("Molho salada: ")) {
                                    cardapioPanel.molhoPlaceholder.textContent = 'Carregando...';
                                    molho = linhaBloco.substring(14);
                                } else if (linhaBloco.includes("Sobremesa: ")) {
                                    cardapioPanel.sobremesaPlaceholder.textContent = 'Carregando...';
                                    sobremesa = linhaBloco.substring(11);
                                }
                            }
                            console.log(carne, carneJantar, complemento, complementoJantar, salada1, salada2, molho, sobremesa);

                            if (carne === "None" && complemento === "None" && salada1 === "None" && salada2 === "None" && molho === "None" && sobremesa === "None") {
                                console.log('null');
                                // TODO: Adicionar mensagem de erro / cardápio não disponível
                                return;
                            }

                            if (carne === "None") {
                                carne = 'Não disponível';
                            }
                            if (complemento === "None" && complementoJantar === "None") {
                                complemento = 'Não disponível';
                            }
                            if (salada1 === "None") {
                                salada1 = 'Não disponível';
                            }
                            if (salada2 === "None") {
                                salada2 = 'Não disponível';
                            }
                            if (molho === "None") {
                                molho = 'Não disponível';
                            }
                            if (sobremesa === "None") {
                                sobremesa = 'Não disponível';
                            }
                            if (carneJantar === "None" && carne === "None") {
                                carne = 'Não disponível';
                            }
                            if (complementoJantar === "None" && complemento == "None") {
                                complemento = 'Não disponível';
                            }

                            
                            if (diurno) {
                                cardapioPanel.carnePlaceholder.textContent = carne;
                                cardapioPanel.complementoPlaceholder.textContent = complemento;
                                cardapioPanel.salada1Placeholder.textContent = salada1;
                                cardapioPanel.salada2Placeholder.textContent = salada2;
                                cardapioPanel.molhoPlaceholder.textContent = molho;
                                cardapioPanel.sobremesaPlaceholder.textContent = sobremesa;
                            }
                            else {
                                cardapioPanel.carnePlaceholder.textContent = carneJantar;
                                cardapioPanel.complementoPlaceholder.textContent = complementoJantar;
                                cardapioPanel.salada1Placeholder.textContent = salada1;
                                cardapioPanel.salada2Placeholder.textContent = salada2;
                                cardapioPanel.molhoPlaceholder.textContent = molho;
                                cardapioPanel.sobremesaPlaceholder.textContent = sobremesa;
                            }
                            return;
                        }
                    }
                }
            }

            if (!blocoEncontrado) {
                console.log(`Não há cardápio disponível para ${dia_semana_atual}, ${data_atual_formatada}.`);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar o cardápio:', error);
        });
}

function carregarLinks() {
    console.log('Carregando links...');
    var url = '/process';
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
            } else {
                console.error('Erro ao carregar links.');
            }
        }
    };

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();
}

function carregarCardapio() {
    console.log('Carregando cardápio...');
    var dataEscolhida = document.getElementById('dataEscolhida').value;
    var cardapioPanel = {
        carboidratoPlaceholder: document.getElementById('carboidrato-placeholder'),
        graoPlaceholder: document.getElementById('grao-placeholder'),
        complementoPlaceholder: document.getElementById('complemento-placeholder'),
        carnePlaceholder: document.getElementById('carne-placeholder'),
        salada1Placeholder: document.getElementById('salada-1-placeholder'),
        salada2Placeholder: document.getElementById('salada-2-placeholder'),
        molhoPlaceholder: document.getElementById('molho-placeholder'),
        sobremesaPlaceholder: document.getElementById('sobremesa-placeholder'),
        dataAtual: document.getElementById('data-atual')
    };
    if (!dataEscolhida) {
        console.log('Nenhuma data escolhida. Usando data atual.');
        var hoje = new Date();
        var dd = hoje.getDate();
        var mm = hoje.getMonth() + 1; //Janeiro é 0!
        var yyyy = hoje.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        dataEscolhida = yyyy + '-' + mm + '-' + dd;
    }

    console.log('Data escolhida: ' + dataEscolhida);

    var url = '/getCardapio';
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                cardapioPanel.carnePlaceholder.innerHTML = xhr.responseText;
                atualizarFront(new Date(dataEscolhida), cardapioPanel);
            } else {
                console.error('Erro ao carregar cardápio.');
            }
        }
    };

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('dataEscolhida=' + encodeURIComponent(dataEscolhida));
}

function toggleActiveClass() {
    const diurnoButton = document.getElementById('diurno');
    const noturnoButton = document.getElementById('noturno');

    diurnoButton.classList.add('active');

    diurnoButton.addEventListener('click', () => {
        diurnoButton.classList.add('active');
        noturnoButton.classList.remove('active');
        carregarCardapio();
    });

    noturnoButton.addEventListener('click', () => {
        noturnoButton.classList.add('active');
        diurnoButton.classList.remove('active');
        carregarCardapio();
    });

    document.getElementById('proximo').addEventListener('click', function() {
        // Obtém a data selecionada no input
        var dataEscolhida = document.getElementById('dataEscolhida').value;
        
        // Cria um objeto Date com a data selecionada
        var data = new Date(dataEscolhida);
        
        // Adiciona 1 dia à data
        data.setDate(data.getDate() + 1);
        
        // Atualiza o valor do input com a nova data
        document.getElementById('dataEscolhida').value = data.toISOString().split('T')[0];

        carregarCardapio();
    });
    
    document.getElementById('anterior').addEventListener('click', function() {
        // Obtém a data selecionada no input
        var dataEscolhida = document.getElementById('dataEscolhida').value;
        
        // Cria um objeto Date com a data selecionada
        var data = new Date(dataEscolhida);
        
        // Subtrai 1 dia da data
        data.setDate(data.getDate() - 1);
        
        // Atualiza o valor do input com a nova data
        document.getElementById('dataEscolhida').value = data.toISOString().split('T')[0];

        carregarCardapio();
    });
    

    
}

function inicio() {
    toggleActiveClass();
    carregarLinks();
    var dataEscolhida = document.getElementById('dataEscolhida').value;
    if (!dataEscolhida) {
        console.log('Nenhuma data escolhida. Usando data atual.');
        var hoje = new Date();
        var dd = hoje.getDate();
        var mm = hoje.getMonth() + 1; //Janeiro é 0!
        var yyyy = hoje.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        dataEscolhida = yyyy + '-' + mm + '-' + dd;
    }
    document.getElementById('dataEscolhida').value = dataEscolhida;
    carregarCardapio();

}