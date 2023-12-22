function carregarCardapio() {
    console.log('Carregando cardápio...');
    // Adicione este bloco de script no final do seu arquivo HTML
    // para atualizar o cardápio com base na data escolhida pelo usuário
    var dataEscolhida = document.getElementById('dataEscolhida').value;
    var cardapioPanel = document.getElementById('cardapio-panel');

    // Verifique se a data foi escolhida
    console.log('Data escolhida: ' + dataEscolhida);

    // Substitua a URL abaixo pela rota correta no seu aplicativo Flask
    var url = '/getCardapio';

    // Crie uma instância do objeto XMLHttpRequest
    var xhr = new XMLHttpRequest();

    // Defina a função de retorno de chamada quando a solicitação for concluída
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Atualize o painel do cardápio com as informações recebidas do servidor
                cardapioPanel.innerHTML = xhr.responseText;
            } else {
                console.error('Erro ao carregar cardápio.');
            }
        }
    };

    // Abra uma solicitação POST para a URL com a data escolhida como parâmetro
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('dataEscolhida=' + encodeURIComponent(dataEscolhida));
}