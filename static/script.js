
function carregarCardapio() {
    const dias_da_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const meses_do_ano = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'nov', 'dez'];
    const data = new Date();
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();
    const dia_semana_atual = dias_da_semana[data.getDay() - 1];
    const cardapioPanel = document.getElementById('cardapio-panel');
    const carnePlaceholder = document.getElementById('carne-placeholder');
    const carneJantarPlaceholder = document.getElementById('carne-jantar-placeholder');
    const complementoPlaceholder = document.getElementById('complemento-placeholder');
    const complementoJantarPlaceholder = document.getElementById('complemento-jantar-placeholder');
    const salada1Placeholder = document.getElementById('salada-1-placeholder');
    const salada2Placeholder = document.getElementById('salada-2-placeholder');
    const molhoSaladaPlaceholder = document.getElementById('molho-salada-placeholder');
    const sobremesaPlaceholder = document.getElementById('sobremesa-placeholder');

    const data_atual_formatada = `${dia}/${mes}/${ano}`;


    // vai pra rota /process e pega o arquivo cardapio.txt
    // depois de pegar o arquivo, vai pra rota /process e pega o arquivo cardapio.txt
    // depois de pegar o arquivo, vai pra rota /process e pega o arquivo cardapio.txt

    fetch('/process')
        .then(response => response.text())
        .then(text => {
            console.log(text)
        })
        .catch(error => {
            console.error('Erro ao carregar o cardápio:', error);
        });


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
                                    carnePlaceholder.textContent = linhaBloco.substring(7);
                                } else if (linhaBloco.includes("Carne jantar: ")) {
                                    carneJantarPlaceholder.textContent = linhaBloco.substring(14);
                                } else if (linhaBloco.includes("Complemento: ")) {
                                    complementoPlaceholder.textContent = linhaBloco.substring(13);
                                } else if (linhaBloco.includes("Complemento jantar: ")) {
                                    complementoJantarPlaceholder.textContent = linhaBloco.substring(20);
                                } else if (linhaBloco.includes("Salada 1: ")) {
                                    salada1Placeholder.textContent = linhaBloco.substring(10);
                                } else if (linhaBloco.includes("Salada 2: ")) {
                                    salada2Placeholder.textContent = linhaBloco.substring(10);
                                } else if (linhaBloco.includes("Molho salada: ")) {
                                    molhoSaladaPlaceholder.textContent = linhaBloco.substring(14);
                                } else if (linhaBloco.includes("Sobremesa: ")) {
                                    sobremesaPlaceholder.textContent = linhaBloco.substring(11);
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

    const data_atual = document.getElementById('data-atual');
    data_atual.textContent = `Hoje é ${dia_semana_atual}, ${data_atual_formatada}`;
}
