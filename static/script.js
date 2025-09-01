function atualizarFront(data, menuPanel) {
    console.log('Atualizando front...');
    const dias_da_semana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const data_atual_formatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
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

    const diurnoButton = document.getElementById('diurno');
    diurno = diurnoButton.classList.contains('active');

    fetch('static/cardapio.txt')
        .then(response => response.text())
        .then(text => {
            exibirMensagemCarregado();
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
                                "Carboidrato: ": { placeholder: "carboidratoPlaceholder", variable: "carboidrato", start: 13 },
                                "Grao: ": { placeholder: "graoPlaceholder", variable: "grao", start: 6 },
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
                            var aviso = document.querySelector('.aviso-cardapio');
                            if (aviso) {
                                aviso.remove();
                            }

                            console.log('Menu disponível: ' + menuIsAvailable);

                            if (!menuIsAvailable) {
                                esconderPainel();
                                exibirAviso();  // Passa o menuPanel para posicionar o aviso corretamente
                                return;
                            }

                            esconderAviso();
                            mostrarPainel();

                            if (carboidrato === "None") {
                                carboidrato = 'Não especificado';
                            }
                            if (grao === "None") {
                                grao = 'Não especificado';
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

                            menuPanel.carboidratoPlaceholder.textContent = carboidrato;
                            menuPanel.graoPlaceholder.textContent = grao;
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

// Função modificada para esconder apenas os elementos do cardápio
function esconderPainel() {
    var itemsToHide = document.querySelectorAll('#panel .list-item');
    itemsToHide.forEach(item => {
        item.style.visibility = 'hidden'; // Esconde cada item do cardápio
    });
}

// Função para mostrar o painel e todos os seus elementos
function mostrarPainel() {
    var itemsToShow = document.querySelectorAll('#panel .list-item');
    itemsToShow.forEach(item => {
        item.style.visibility = 'visible'; // Mostra cada item do cardápio
    });
}

function removerMensagemCarregado() {
    var mensagem = document.querySelector('.mensagem-carregado');
    if (mensagem) {
        mensagem.remove(); // Remove a mensagem de "Carregado" do documento
    }
}

// Função para exibir a mensagem de "Carregando"
function exibirMensagemCarregando() {
    removerMensagemCarregando();
    // Verifica se a mensagem de "Carregando" já existe no documento
    if (!document.querySelector('.mensagem-carregando')) {
        var mensagem = document.createElement('div');
        mensagem.textContent = 'Carregando...';
        mensagem.classList.add('mensagem-carregando'); // Adiciona uma classe à mensagem para identificação
        mensagem.style.position = 'fixed'; // Define a posição como fixa para que a mensagem permaneça na mesma posição ao rolar a página
        mensagem.style.top = '20px'; // Ajusta a distância do topo da tela
        mensagem.style.left = '50%'; // Centraliza a mensagem na horizontal
        mensagem.style.transform = 'translateX(-50%)'; // Centraliza a mensagem na horizontal
        mensagem.style.backgroundColor = 'rgba(0, 0, 255, 0.5)'; // Cor de fundo azul com transparência
        mensagem.style.padding = '10px'; // Adiciona um preenchimento ao redor do texto da mensagem
        mensagem.style.color = '#fff'; // Cor do texto da mensagem
        mensagem.style.borderRadius = '5px'; // Adiciona bordas arredondadas à mensagem
        document.body.appendChild(mensagem); // Adiciona a mensagem diretamente ao corpo do documento
    }
}



// Função para exibir a mensagem de "Carregado" com símbolo de verificado
function exibirMensagemCarregado() {
    removerMensagemCarregando();  // Garante que a mensagem de carregando é removida

    var mensagem = document.createElement('div');
    mensagem.textContent = 'Carregado ';
    mensagem.classList.add('mensagem-carregado');
    
    var simboloVerificado = document.createElement('span');
    simboloVerificado.classList.add('icon-check');
    simboloVerificado.innerHTML = '&#10003;'; // Símbolo de verificado
    
    mensagem.appendChild(simboloVerificado);

    mensagem.style.position = 'fixed';
    mensagem.style.top = '20px';
    mensagem.style.left = '50%';
    mensagem.style.transform = 'translateX(-50%)';
    mensagem.style.backgroundColor = 'rgba(0, 128, 0, 0.7)'; // Cor verde com transparência
    mensagem.style.padding = '10px';
    mensagem.style.color = '#fff';
    mensagem.style.borderRadius = '5px';

    document.body.appendChild(mensagem);

    // Remover mensagem após um certo tempo
    setTimeout(function() {
        mensagem.remove();
    }, 1000); // A mensagem desaparece após 3 segundos
}

// Função para remover a mensagem de "Carregando"
function removerMensagemCarregando() {
    var mensagem = document.querySelector('.mensagem-carregando');
    if (mensagem) {
        mensagem.remove(); // Remove a mensagem de "Carregando" do documento
    }
}

// Função para simular o carregamento de dados (substitua esta função pela sua lógica real de carregamento de dados)
function carregarDados() {
    exibirMensagemCarregando(); // Exibe a mensagem de "Carregando"
    
    setTimeout(function() {
        removerMensagemCarregando(); // Remove a mensagem de "Carregando" após 2 segundos
    }, 2000);
}

// Função para exibir o aviso
function exibirAviso() {
    var panelContainer = document.getElementById('panel');

    // Remove qualquer aviso prévio para evitar duplicatas
    var avisoExistente = panelContainer.querySelector('.aviso-cardapio');
    if (avisoExistente) {
        avisoExistente.remove();
    }

    var aviso = document.createElement('div');
    aviso.textContent = 'Esse cardápio não está disponível ainda';
    aviso.classList.add('aviso-cardapio');
    
    aviso.style.position = 'absolute';
    aviso.style.top = '50%';
    aviso.style.left = '50%';
    aviso.style.transform = 'translate(-50%, -50%)';
    aviso.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
    aviso.style.padding = '20px';
    aviso.style.color = 'white';
    aviso.style.borderRadius = '10px';
    aviso.style.textAlign = 'center';
    aviso.style.width = '80%';
    aviso.style.maxWidth = '600px';  // Ajuste conforme necessário para o seu layout

    // Definindo o container para posicionar relativamente
    panelContainer.style.position = 'relative';
    panelContainer.style.minHeight = '200px'; // Garante que o painel tenha altura mínima para mostrar o aviso

    // Anexando o aviso ao painel
    panelContainer.appendChild(aviso);
}

function esconderAviso() {

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
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        dataEscolhida = `${ano}-${mes}-${dia}`;
    }

    console.log('Data escolhida: ' + dataEscolhida);

    const [ano, mes, dia] = dataEscolhida.split('-');
    const dataObj = new Date(ano, mes - 1, dia);

    var url = '/getCardapio';
    var xhr = new XMLHttpRequest();

    exibirMensagemCarregando(); // Exibe a mensagem de carregamento

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            removerMensagemCarregando(); // Remove a mensagem de carregamento
            if (xhr.status === 200) {
                atualizarFront(dataObj, menuPanel);
            } else {
                console.error('Erro ao carregar o cardápio.');
                exibirAviso(); // Exibe um aviso em caso de erro
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
        var dataEscolhida = document.getElementById('dataEscolhida').value;
        var [ano, mes, dia] = dataEscolhida.split('-');
        var data = new Date(ano, mes - 1, dia);
        data.setDate(data.getDate() + 1);
        var novoAno = data.getFullYear();
        var novoMes = String(data.getMonth() + 1).padStart(2, '0');
        var novoDia = String(data.getDate()).padStart(2, '0');
        document.getElementById('dataEscolhida').value = `${novoAno}-${novoMes}-${novoDia}`;
        carregarCardapio();
    });

    document.getElementById('anterior').addEventListener('click', function() {
        var dataEscolhida = document.getElementById('dataEscolhida').value;
        var [ano, mes, dia] = dataEscolhida.split('-');
        var data = new Date(ano, mes - 1, dia);
        data.setDate(data.getDate() - 1);
        var novoAno = data.getFullYear();
        var novoMes = String(data.getMonth() + 1).padStart(2, '0');
        var novoDia = String(data.getDate()).padStart(2, '0');
        document.getElementById('dataEscolhida').value = `${novoAno}-${novoMes}-${novoDia}`;
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
    carregarDados();
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