function atualizarFront(data, cardapioPanel) {
    const dias_da_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const data_atual_formatada = `${(data.getDate()+1).toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
    const dia_semana_atual = dias_da_semana[data.getDay()];


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

                        if (linha.trim() === '') {
                            const linhasBloco = blocoAtual.split('\n');
                            for (const linhaBloco of linhasBloco) {
                                if (linhaBloco.includes("Carne: ")) {
                                    cardapioPanel.carnePlaceholder.textContent = linhaBloco.substring(7);
                                } else if (linhaBloco.includes("Carne jantar: ")) {
                                    cardapioPanel.carneJantarPlaceholder.textContent = linhaBloco.substring(14);
                                } else if (linhaBloco.includes("Complemento: ")) {
                                    cardapioPanel.complementoPlaceholder.textContent = linhaBloco.substring(13);
                                } else if (linhaBloco.includes("Complemento jantar: ")) {
                                    cardapioPanel.complementoJantarPlaceholder.textContent = linhaBloco.substring(20);
                                } else if (linhaBloco.includes("Salada 1: ")) {
                                    cardapioPanel.salada1Placeholder.textContent = linhaBloco.substring(10);
                                } else if (linhaBloco.includes("Salada 2: ")) {
                                    cardapioPanel.salada2Placeholder.textContent = linhaBloco.substring(10);
                                } else if (linhaBloco.includes("Molho salada: ")) {
                                    cardapioPanel.molhoSaladaPlaceholder.textContent = linhaBloco.substring(14);
                                } else if (linhaBloco.includes("Sobremesa: ")) {
                                    cardapioPanel.sobremesaPlaceholder.textContent = linhaBloco.substring(11);
                                }
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

    cardapioPanel.dataAtual.textContent = `Hoje é ${dia_semana_atual}, ${data_atual_formatada}`;
}

function carregarLinks() {
    console.log('Carregando links...');
    var linksPanel = document.getElementById('links-panel');
    var url = '/process';
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                linksPanel.innerHTML = xhr.responseText;
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
        carnePlaceholder: document.getElementById('carne-placeholder'),
        carneJantarPlaceholder: document.getElementById('carne-jantar-placeholder'),
        complementoPlaceholder: document.getElementById('complemento-placeholder'),
        complementoJantarPlaceholder: document.getElementById('complemento-jantar-placeholder'),
        salada1Placeholder: document.getElementById('salada-1-placeholder'),
        salada2Placeholder: document.getElementById('salada-2-placeholder'),
        molhoSaladaPlaceholder: document.getElementById('molho-salada-placeholder'),
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
                cardapioPanel.innerHTML = xhr.responseText;
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
