import datetime
from io import BytesIO
from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup
import json
import re
import fitz

app = Flask(__name__, static_folder='static', template_folder='templates')

def fix_html_encoding(html_content):
    # Substitui a representação Unicode \u00e0 pelo caractere "à" no HTML
    html_content = html_content.replace(r'\u00e0', 'à')
    html_content = html_content.replace(r"%C3%A0", 'à')

    return html_content



def extract_links_by_week(html_content):
    # Dicionário para armazenar os links por semana
    links_by_week = {}

    # Corrigir a codificação do HTML antes de passá-lo para o BeautifulSoup
    corrected_html = fix_html_encoding(html_content)

    # Criar o objeto BeautifulSoup com o HTML corrigido
    soup = BeautifulSoup(corrected_html, 'html.parser')

    # Encontrar o elemento com a classe 'content clearfix'
    content_element = soup.find(class_='content clearfix')

    ano = datetime.datetime.now().year

    if content_element:
        # Encontrar todos os elementos <li> dentro do elemento com a classe 'content clearfix'
        li_elements = content_element.find_all('li')

        for li_element in li_elements:
            # Extrair o intervalo de datas usando regex
            # Exemplo: "03 a 09.ABR" -> 03abr09abr
            match = re.match(r'(\d{2})(?:\.(\w{3}))? a (\d{2})\.(\w{3})', li_element.get_text())
            meses = {mes[:3]: f"{str(i).zfill(2)}" for i, mes in enumerate(["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"], start=1)}
           

            if match:
                inicio_dia, inicio_mes, fim_dia, fim_mes = match.groups()
                # inicio_mes se tiver vai ser o w{3}, se não vai ser igual ao fim_mes
                if not inicio_mes:
                    inicio_mes = fim_mes

                data = f"{inicio_dia}{meses[inicio_mes.lower()]}{ano}{fim_dia}{meses[fim_mes.lower()]}{ano}"
                print(data)
                # Encontrar o elemento <a> dentro do elemento <li>
                link_element = li_element.find('a')
                if link_element:
                    # Corrigir a codificação do link usando a biblioteca html
                    link = link_element['href']

                    # Adicionar o link ao dicionário usando a chave "data"
                    links_by_week[data] = link

    return links_by_week
@app.route('/')
def index():
    """
    Renders the main page with a button for the user to click.
    """
    return render_template('index.html')

@app.route('/download', methods=['POST'])
def download_pdf(url, destination):
    response = requests.get(url, verify=False)
    
    with open(destination, 'wb') as pdf_file:
        pdf_file.write(response.content)

@app.route('/extract', methods=['POST'])
def extract_text_from_pdf(pdf_path, page_number=0):
    doc = fitz.open(pdf_path)
    
    # Verifique se o número da página fornecido é válido
    if 0 <= page_number < doc.page_count:
        page = doc[page_number]
        text = page.get_text()

        text = re.sub(r'(\b\w+?-FEIRA\b)', r'\n\n\1', text)
        text = re.sub(r'(\bSÁBADO\b)', r'\n\n\1-FEIRA', text)
        text = re.sub(r'(\bDOMINGO\b)', r'\n\n\1-FEIRA', text)
        text = re.sub(r'^.*SEGUNDA-FEIRA', r'SEGUNDA-FEIRA', text, flags=re.DOTALL)
    else:
        text = ''
    
    doc.close()
    return text

@app.route('/process', methods=['POST'])
def process():
    """
    Performs a web scraping action when the user clicks the button.
    """
    try:
        # Web scraping logic
        website_url = 'https://ru.ufsc.br/ru/'
        response = requests.get(website_url)
        html_content = response.text

        # Extract links by week
        links_by_week = extract_links_by_week(html_content)

        # Create a JSON object with the extracted links
        cardapios_salvos = json.dumps(links_by_week, ensure_ascii=False, indent=2)

        with open('cardapios_salvos.json', 'w') as json_file:
            json_file.write(cardapios_salvos)   

        return render_template('index.html', result=f"Action successful! Extracted links:\n{cardapios_salvos}")

    except Exception as e:
        return render_template('index.html', result=f"Action failed (1): {str(e)}")

def extrair_dados_do_PDF(pdf_content):
    menu_info = []

    # Padrões de expressões regulares para extrair informações específicas
    dia_semana_pattern = re.compile(r'(\w+)\-FEIRA', re.IGNORECASE)
    data_pattern = re.compile(r'(\d{2}/\d{2}/\d{4})', re.IGNORECASE)
    carne_pattern = re.compile(r'CARNE:\s*(.+)', re.IGNORECASE)
    carne_jantar_pattern = re.compile(r'CARNE JANTAR:\s*(.+)', re.IGNORECASE)
    complemento_pattern = re.compile(r'COMPLEMENTO ALMOÇO:\s*(.+)', re.IGNORECASE)
    complemento_jantar_pattern = re.compile(r'COMPLEMENTO JANTAR:\s*(.+)', re.IGNORECASE)
    salada1_pattern = re.compile(r'SALADA 1:\s*(.+)', re.IGNORECASE)
    salada2_pattern = re.compile(r'SALADA 2:\s*(.+)', re.IGNORECASE)
    molho_salada_pattern = re.compile(r'MOLHO SALADA:\s*(.+)', re.IGNORECASE)
    sobremesa_pattern = re.compile(r'SOBREMESA:\s*(.+?)\s{2,}', re.IGNORECASE)

    # Dividir o texto em dias
    dias = pdf_content.split('\n\n')

    # Extrair informações para cada dia
    for dia in dias:
        menu_info_dia = {}

        # Encontrar correspondências para cada padrão
        dia_semana_match = dia_semana_pattern.search(dia)
        data_match = data_pattern.search(dia)
        carne_match = carne_pattern.search(dia)
        carne_jantar_match = carne_jantar_pattern.search(dia)
        complemento_match = complemento_pattern.search(dia)
        complemento_jantar_match = complemento_jantar_pattern.search(dia)
        salada1_match = salada1_pattern.search(dia)
        salada2_match = salada2_pattern.search(dia)
        molho_salada_match = molho_salada_pattern.search(dia)
        sobremesa_match = sobremesa_pattern.search(dia)

        # Função para remover texto após dois espaços consecutivos
        def remove_text_after_consecutive_spaces(match):
            if match:
                text = match.group(1)
                index_of_consecutive_spaces = text.find("  ")
                if index_of_consecutive_spaces != -1:
                    text = text[:index_of_consecutive_spaces]
                return text
            return None

        # Extrair dados correspondentes
        menu_info_dia["Dia da semana"] = dia_semana_match.group(1).capitalize() if dia_semana_match else None
        menu_info_dia["Data"] = data_match.group(1) if data_match else None
        menu_info_dia["Carne"] = remove_text_after_consecutive_spaces(carne_match)
        menu_info_dia["Carne jantar"] = remove_text_after_consecutive_spaces(carne_jantar_match)
        if not menu_info_dia["Carne jantar"]:
            # Se não houver complemento jantar, copie o complemento do almoço
            menu_info_dia["Carne jantar"] = menu_info_dia["Carne"]
        else:
            menu_info_dia["Carne jantar"] = remove_text_after_consecutive_spaces(carne_jantar_match)
        menu_info_dia["Complemento"] = remove_text_after_consecutive_spaces(complemento_match)
        menu_info_dia["Complemento jantar"] = remove_text_after_consecutive_spaces(complemento_jantar_match)
        if not menu_info_dia["Complemento jantar"]:
            # Se não houver complemento jantar, copie o complemento do almoço
            menu_info_dia["Complemento jantar"] = menu_info_dia["Complemento"]
        else:
            menu_info_dia["Complemento jantar"] = remove_text_after_consecutive_spaces(complemento_jantar_match)
        menu_info_dia["Salada 1"] = remove_text_after_consecutive_spaces(salada1_match)
        menu_info_dia["Salada 2"] = remove_text_after_consecutive_spaces(salada2_match)
        menu_info_dia["Molho salada"] = remove_text_after_consecutive_spaces(molho_salada_match)
        menu_info_dia["Sobremesa"] = sobremesa_match.group(1) if sobremesa_match else None

        menu_info.append(menu_info_dia)

    return menu_info

@app.route('/getCardapio', methods=['POST'])
def getCardapio():

    try:
        # Extrair a data escolhida pelo usuário
        user_date_str = request.form.get('dataEscolhida')
        print(f'Data escolhida pelo usuário: {user_date_str}')


        # Carregar o JSON com os links
        with open('cardapios_salvos.json', 'r') as json_file:
            cardapio_atual = json.load(json_file)

        # Se nenhum dataEscolhida for fornecido, defina user_date como a primeira data do JSON
        if not user_date_str:
            # Verifique se há pelo menos uma chave no JSON
            if cardapio_atual:
                user_date_str = list(cardapio_atual.keys())[0]
                print(f'Usuário não escolheu data, exibindo cardápio mais recente: {user_date_str}')
            else:
                return render_template('index.html', result="Nenhuma data disponível no cardápio.")

        # Dividir a data usando os caracteres de hífen
        ano, mes, dia = user_date_str.split('-')

        # Converter as strings para inteiros
        ano = int(ano)
        mes = int(mes)
        dia = int(dia)

        print(f'Dia: {dia}, Mês: {mes}, Ano: {ano}')

        # Encontrar o link correspondente na estrutura JSON
        link_key = None
        for key in cardapio_atual.keys():
            dia_de_inicio_do_intervalo = int(key[0:2])
            mes_de_inicio_do_intervalo = int(key[2:4])
            ano_de_inicio_do_intervalo = int(key[4:8])
            dia_de_fim_do_intervalo = int(key[8:10])
            mes_de_fim_do_intervalo = int(key[10:12])
            ano_de_fim_do_intervalo = int(key[12:16])

            # Verificar se a data escolhida pelo usuário está dentro do intervalo
            # sem usar a biblioteca datetime
            if ano_de_inicio_do_intervalo <= ano <= ano_de_fim_do_intervalo:
                if mes_de_inicio_do_intervalo != mes_de_fim_do_intervalo:
                    if mes_de_inicio_do_intervalo == mes:
                        if dia_de_inicio_do_intervalo <= dia:
                            link_key = key
                            print(f'Link encontrado para a data escolhida: {link_key}')
                            break
                    elif mes_de_fim_do_intervalo == mes:
                        if dia <= dia_de_fim_do_intervalo:
                            link_key = key
                            print(f'Link encontrado para a data escolhida: {link_key}')
                            break
                else:
                    if mes_de_inicio_do_intervalo == mes:
                        if dia_de_inicio_do_intervalo <= dia <= dia_de_fim_do_intervalo:
                            link_key = key
                            print(f'Link encontrado para a data escolhida: {link_key}')
                            break
            else:
                print(f'Nenhuma data encontrada para a data escolhida: {user_date_str}')
                

        # Extrair o link correspondente
        link = cardapio_atual[link_key]

        # Extrair o PDF correspondente
        pdf_content = extract_text_from_pdf(link)

        # Extrair dados do PDF
        menu_info = extrair_dados_do_PDF(pdf_content)

        return render_template('index.html', result=f"Ação bem-sucedida! Texto extraído:\n{menu_info}")

    except Exception as e:
        return render_template('index.html', result=f"Ação falhou (2): {str(e)}")


if __name__ == '__main__':
    app.run(debug=True)
