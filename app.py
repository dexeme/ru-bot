# coding=utf-8
import datetime
import os
import json
import re

import requests
from bs4 import BeautifulSoup
import pdfplumber
from flask import Flask, render_template, request

app = Flask(__name__, static_folder='static', template_folder='templates')

# --- util e constantes ---

MESES = {
    "jan": "01",
    "fev": "02",
    "mar": "03",
    "abr": "04",
    "mai": "05",
    "jun": "06",
    "jul": "07",
    "ago": "08",
    "set": "09",
    "out": "10",
    "nov": "11",
    "dez": "12",
}



def fix_html_encoding(html_content):
    html_content = html_content.replace(r'\u00e0', 'à').replace(r"%C3%A0", 'à')
    return html_content



def normalize_year(year_str, fallback):
    if year_str:
        year = int(year_str)
        if year < 100:
            year += 2000
        return year
    return fallback

def extract_links_by_week(html_content):
    # Dicionário para armazenar os links por semana
    links_by_week = {}

    # Corrigir a codificação do HTML antes de passá-lo para o BeautifulSoup
    corrected_html = fix_html_encoding(html_content)

    # Criar o objeto BeautifulSoup com o HTML corrigido
    soup = BeautifulSoup(corrected_html, 'html.parser')

    # Encontrar o elemento com a classe 'content clearfix'
    content_element = soup.find(class_='content clearfix')

    if content_element:
        # Tentar capturar o ano exibido no conteúdo (ex.: "2025") para usar como
        # ano padrão quando o texto das datas ou o link não informarem o ano.
        year_match = re.search(r"\b(20\d{2})\b", content_element.get_text())
        page_year = int(year_match.group(1)) if year_match else datetime.datetime.now().year

        # Encontrar todos os elementos <li> dentro do elemento com a classe 'content clearfix'
        li_elements = content_element.find_all('li')

        for li_element in li_elements:
            # Extrai o texto dentro do elemento <li>
            li_text = li_element.get_text()

            # Extrair o intervalo de datas usando regex que aceita diferentes formatos
            match = re.search(
                r'(\d{2})[./](\d{2}|\w{3})(?:[./](\d{2,4}))?\s*(?:a\s*)?(\d{2})[./](\d{2}|\w{3})(?:[./](\d{2,4}))?',
                li_text,
                re.IGNORECASE,
            )
            if match:
                (
                    inicio_dia,
                    inicio_mes,
                    inicio_ano_str,
                    fim_dia,
                    fim_mes,
                    fim_ano_str,
                ) = match.groups()

                inicio_mes = inicio_mes.zfill(2) if inicio_mes.isdigit() else MESES.get(inicio_mes[:3].lower(), "01")
                fim_mes = fim_mes.zfill(2) if fim_mes.isdigit() else MESES.get(fim_mes[:3].lower(), "01")

                # Encontrar o elemento <a> dentro do elemento <li>
                link_element = li_element.find("a")
                if link_element:
                    link = link_element["href"]

                    # O texto do link pode apontar para um diretório antigo (ex.: 2012).
                    # Por isso usamos o ano exibido na página como base, aplicando a
                    # normalização apenas quando o texto da data traz algum ano.
                    inicio_ano = normalize_year(inicio_ano_str, page_year)
                    fim_ano = normalize_year(fim_ano_str, inicio_ano)

                    # Quando o intervalo atravessa o fim de ano (ex.: 28.12 a 03.01)
                    # e o ano final não foi especificado, assume-se o ano seguinte.
                    if not fim_ano_str and inicio_mes == '12' and fim_mes == '01':
                        fim_ano += 1

                    data = f"{inicio_dia}{inicio_mes}{inicio_ano:04d}{fim_dia}{fim_mes}{fim_ano:04d}"
                    links_by_week[data] = link

    return links_by_week

# --- helpers de PDF ---

def download_pdf(url, destination):
    response = requests.get(url, verify=False)
    
    with open(destination, 'wb') as pdf_file:
        pdf_file.write(response.content)

def extract_text_from_pdf(pdf_path, page_number=0):
    with pdfplumber.open(pdf_path) as pdf:
        if 0 <= page_number < len(pdf.pages):
            page = pdf.pages[page_number]
            text = page.extract_text() or ""
            text = re.sub(r'(\b\w+?-FEIRA\b)', r'\n\n\1', text)
            text = re.sub(r'(\bSÁBADO\b)', r'\n\n\1-FEIRA', text)
            text = re.sub(r'(\bDOMINGO\b)', r'\n\n\1-FEIRA', text)
            text = re.sub(r'^.*SEGUNDA-FEIRA', r'SEGUNDA-FEIRA', text, flags=re.DOTALL)
            return text
    return ""

def extrair_dados_do_PDF(pdf_content):
    menu_info = []
    dia_semana_pattern = re.compile(r'(\w+)\-FEIRA', re.IGNORECASE)
    data_pattern = re.compile(r'(\d{2}/\d{2}/\d{4})', re.IGNORECASE)
    carne_pattern = re.compile(r'CARNE:\s*(.+)', re.IGNORECASE)
    carne_jantar_pattern = re.compile(r'CARNE JANTAR:\s*(.+)', re.IGNORECASE)
    complemento_pattern = re.compile(r'COMPLEMENTO:\s*(.+)', re.IGNORECASE)
    complemento_almoco_pattern = re.compile(r'COMPLEMENTO ALMOÇO:\s*(.+)', re.IGNORECASE)
    complemento_jantar_pattern = re.compile(r'COMPLEMENTO JANTAR:\s*(.+)', re.IGNORECASE)
    salada1_pattern = re.compile(r'SALADA 1:\s*(.+)', re.IGNORECASE)
    salada2_pattern = re.compile(r'SALADA 2:\s*(.+)', re.IGNORECASE)
    molho_salada_pattern = re.compile(r'MOLHO SALADA:\s*(.+)', re.IGNORECASE)
    sobremesa_pattern = re.compile(r'SOBREMESA:\s*(.+?)(?=\s*MOLHO|\n|$)', re.IGNORECASE)
    arroz_feijao_pattern = re.compile(
        r'ARROZ\s+(BRANCO\s*(?:\/\s*INTEGRAL)?)\s*\/?\s*FEIJÃO\s+(PRETO|CARIOCA|COM\s+VEGETAIS)?',
        re.IGNORECASE
    )

    def trim_after_double_space(match):
        if match:
            text = match.group(1)
            i = text.find("  ")
            if i != -1:
                text = text[:i]
            return text.strip()
        return None

    dias = pdf_content.split('\n\n')
    for dia in dias:
        d = {}
        d["Dia da semana"] = (dia_semana_pattern.search(dia).group(1).capitalize()
                              if dia_semana_pattern.search(dia) else None)
        d["Data"] = (data_pattern.search(dia).group(1) if data_pattern.search(dia) else None)
        d["Carne"] = trim_after_double_space(carne_pattern.search(dia)) or None
        d["Carne jantar"] = (trim_after_double_space(carne_jantar_pattern.search(dia))
                             or d["Carne"])

        d["Complemento"] = (trim_after_double_space(complemento_pattern.search(dia))
                            or trim_after_double_space(complemento_almoco_pattern.search(dia))
                            or trim_after_double_space(complemento_jantar_pattern.search(dia)))
        d["Complemento jantar"] = (trim_after_double_space(complemento_jantar_pattern.search(dia))
                                   or d["Complemento"])

        d["Salada 1"] = trim_after_double_space(salada1_pattern.search(dia)) or None
        d["Salada 2"] = trim_after_double_space(salada2_pattern.search(dia)) or None
        d["Molho salada"] = trim_after_double_space(molho_salada_pattern.search(dia)) or None
        d["Sobremesa"] = trim_after_double_space(sobremesa_pattern.search(dia)) or None

        af = arroz_feijao_pattern.search(dia)
        if af:
            d["Carboidrato"] = 'Arroz ' + af.group(1).capitalize()
            d["Grao"] = 'Feijão ' + (af.group(2).capitalize() if af.group(2) else "Preto")
        else:
            d["Carboidrato"] = None
            d["Grao"] = None

        menu_info.append(d)
    return menu_info

# --- rotas ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    try:
        website_url = 'https://ru.ufsc.br/ru/'
        resp = requests.get(website_url, timeout=30)
        resp.raise_for_status()
        links_by_week = extract_links_by_week(resp.text)

        with open('cardapios_salvos.json', 'w', encoding='utf-8') as f:
            json.dump(links_by_week, f, ensure_ascii=False, indent=2)

        return render_template('index.html',
                               result="Action successful! Extracted links:\n{}".format(
                                   json.dumps(links_by_week, ensure_ascii=False, indent=2)))
    except Exception as e:
        return render_template('index.html', result=f"An error occurred: {e}")

def get_user_date():
    return request.form.get('dataEscolhida')

def load_cardapio_atual():
    with open('cardapios_salvos.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def find_link_in_interval(cardapio_atual, user_date_str):
    ano, mes, dia = map(int, user_date_str.split('-'))
    for key, link in cardapio_atual.items():
        di = int(key[0:2]); mi = int(key[2:4]); ai = int(key[4:8])
        df = int(key[8:10]); mf = int(key[10:12]); af = int(key[12:16])

        # compara sem datetime
        if ai < ano or (ai == ano and (mi < mes or (mi == mes and di <= dia))):
            if af > ano or (af == ano and (mf > mes or (mf == mes and df >= dia))):
                return link
    return None

def download_and_extract_pdf(link):
    destino = 'pdf/cardapio.pdf'
    download_pdf(link, destino)
    pdf_content = extract_text_from_pdf(destino)
    return extrair_dados_do_PDF(pdf_content)

def save_menu_info_to_file(menu_info):
    os.makedirs('static', exist_ok=True)
    with open('static/cardapio.txt', 'w', encoding='utf-8') as txt:
        for menu in menu_info:
            for k, v in menu.items():
                txt.write(f'{k}: {v}\n')
            txt.write('\n')

@app.route('/getCardapio', methods=['POST'])
def getCardapio():
    try:
        user_date_str = get_user_date()
        cardapio_atual = load_cardapio_atual()

        if not user_date_str:
            # Usa hoje
            today = datetime.date.today()
            user_date_str = today.strftime('%Y-%m-%d')

        link = find_link_in_interval(cardapio_atual, user_date_str)
        if not link:
            return render_template('index.html',
                                   result=f"Não há cardápio para {user_date_str} no arquivo atual. "
                                          f"Clique para atualizar os links (Process).")

        menu_info = download_and_extract_pdf(link)
        save_menu_info_to_file(menu_info)
        return render_template('index.html', result=f"Ação bem-sucedida! Texto extraído:\n{menu_info}")
    except Exception as e:
        return render_template('index.html', result=f"Erro ao obter cardápio: {e}")

if __name__ == '__main__':
    app.run(ssl_context="adhoc")
