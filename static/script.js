function atualizarFront(data, menuPanel) {
    console.log('Atualizando front...');
    const dias_da_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const data_atual_formatada = `${(data.getDate() + 1).toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
    const dia_semana_atual = dias_da_semana[data.getDay()];

    diaSemanaPlaceholder = document.getElementById('diaSemana-placeholder');
    carnePlaceholder = document.getElementById('carne-placeholder');
    if (dia_semana_atual === 'Sábado' || dia_semana_atual === 'Domingo') {
        diaSemanaPlaceholder.textContent = dia_semana_atual;
    } else if (diaSemanaPlaceholder.textContent = dia_semana_atual + '-feira') {
        diaSemanaPlaceholder.textContent = dia_semana_atual + '-feira';
    } else if (carnePlaceholder === null) {
        diaSemanaPlaceholder.textContent = 'Indisponível';
    }
    // Seta o texto do placeholder do dia da semana para o dia_semana_atual

    const diurnoButton = document.getElementById('diurno');
    diurno = diurnoButton.classList.contains('active');

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
                        diaSemana = '';
                        if (linha.trim() === '') {
                            const linhasBloco = blocoAtual.split('\n');
                            const placeholdersMapping = {
                                "Tipo de Arroz: ": { placeholder: "carboidratoPlaceholder", variable: "carboidrato", start: 15 },
                                "Tipo de Feijão: ": { placeholder: "graoPlaceholder", variable: "grao", start: 16 },
                                "Carne: ": { placeholder: "carnePlaceholder", variable: "carne", start: 7 },
                                "Carne jantar: ": { placeholder: "carnePlaceholder", variable: "carneJantar", start: 14 },
                                "Complemento: ": { placeholder: "complementoPlaceholder", variable: "complemento", start: 13 },
                                "Complemento jantar: ": { placeholder: "complementoPlaceholder", variable: "complementoJantar", start: 20 },
                                "Salada 1: ": { placeholder: "salada1Placeholder", variable: "salada1", start: 10 },
                                "Salada 2: ": { placeholder: "salada2Placeholder", variable: "salada2", start: 10 },
                                "Molho salada: ": { placeholder: "molhoPlaceholder", variable: "molho", start: 14 },
                                "Sobremesa: ": { placeholder: "sobremesaPlaceholder", variable: "sobremesa", start: 11 }
                            };
                        
                            for (const linhaBloco of linhasBloco) {
                                for (const [placeholderText, { placeholder, variable, start }] of Object.entries(placeholdersMapping)) {
                                    if (linhaBloco.includes(placeholderText)) {
                                        menuPanel[placeholder].textContent = 'Carregando...';
                                        window[variable] = linhaBloco.substring(start);
                                    }
                                }
                            }
                        
                            menuItems = [carboidrato, grao, carne, carneJantar, complemento, complementoJantar, salada1, salada2, molho, sobremesa];
                            console.log(menuItems);

                            if (carboidrato === "None" && grao === "None" && carne === "None" && complemento === "None" && salada1 === "None" && salada2 === "None" && molho === "None" && sobremesa === "None") {
                                menuPanel.carboidratoPlaceholder.textContent = 'Indisponível';
                                menuPanel.graoPlaceholder.textContent = 'Indisponível';
                                menuPanel.carnePlaceholder.textContent = 'Indisponível';
                                menuPanel.complementoPlaceholder.textContent = 'Indisponível';
                                menuPanel.salada1Placeholder.textContent = 'Indisponível';
                                menuPanel.salada2Placeholder.textContent = 'Indisponível';
                                menuPanel.molhoPlaceholder.textContent = 'Indisponível';
                                menuPanel.sobremesaPlaceholder.textContent = 'Indisponível';
                            }

                            const menuIsAvailable = checkIfMenuIsAvailable(menuItems);

                            console.log('Menu disponível: ' + menuIsAvailable);

                            if (!menuIsAvailable) {
                                diaSemanaPlaceholder.textContent = 'Indisponível';
                                console.log('Menu indisponível');
                                return;
                            }


                            if (carne === "None") {
                                carne = 'Não especificado';
                            }
                            if (complemento === "None" && complementoJantar === "None") {
                                complemento = 'Não especificado';
                            }
                            if (salada1 === "None") {
                                salada1 = 'Não especificado';
                            }
                            if (salada2 === "None") {
                                salada2 = 'Não especificado';
                            }
                            if (molho === "None") {
                                molho = 'Não especificado';
                            }
                            if (sobremesa === "None") {
                                sobremesa = 'Não especificado';
                            }
                            if (carneJantar === "None" && carne === "None") {
                                carne = 'Não especificado';
                            }
                            if (complementoJantar === "None" && complemento == "None") {
                                complemento = 'Não especificado';
                            }

                            menuPanel.carboidratoPlaceholder.textContent = diurno ? carboidrato : carboidrato;
                            menuPanel.graoPlaceholder.textContent = diurno ? grao : grao;
                            menuPanel.carnePlaceholder.textContent = diurno ? carne : carneJantar;
                            menuPanel.complementoPlaceholder.textContent = diurno ? complemento : complementoJantar;
                            menuPanel.salada1Placeholder.textContent = salada1;
                            menuPanel.salada2Placeholder.textContent = salada2;
                            menuPanel.molhoPlaceholder.textContent = molho;
                            menuPanel.sobremesaPlaceholder.textContent = sobremesa;
                            
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
            console.error('Erro ao carregar o cardápiossssssss:', error);
            diaSemanaPlaceholder.textContent = 'Indisponível';

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
    var menuPanel = loadMenuPanel();

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
                atualizarFront(new Date(dataEscolhida), menuPanel);
            } else {
                console.error('Erro ao carregar cardápiosdsdsdsd.');
                menuPanel.carboidratoPlaceholder.textContent = 'Indisponível';
                menuPanel.graoPlaceholder.textContent = 'Indisponível';
                menuPanel.carnePlaceholder.textContent = 'Indisponível';
                menuPanel.complementoPlaceholder.textContent = 'Indisponível';
                menuPanel.salada1Placeholder.textContent = 'Indisponível';
                menuPanel.salada2Placeholder.textContent = 'Indisponível';
                menuPanel.molhoPlaceholder.textContent = 'Indisponível';
                menuPanel.sobremesaPlaceholder.textContent = 'Indisponível';
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

function loadMenuPanel() {
    const menuPanel = {
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

    return menuPanel;
}

function checkIfMenuIsAvailable(menuItems) {
    let menuIsAvailable = false;

    // Varre a lista, só retorna false se todos os itens forem 'None'
    menuItems.forEach(item => {
        if (item !== 'None') {
            menuIsAvailable = true;
        }
    });

    return menuIsAvailable;
}