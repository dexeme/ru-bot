from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup
import json
import re
import fitz

app = Flask(__name__)

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

    if content_element:
        # Encontrar todos os elementos <li> dentro do elemento com a classe 'content clearfix'
        li_elements = content_element.find_all('li')

        for li_element in li_elements:
            # Extrair o intervalo de datas usando regex
            match = re.match(r'(\d{2}) a (\d{2})\.(\w{3})', li_element.get_text())
            if match:
                inicio_dia, fim_dia, mes_abreviado = match.groups()
                mes_abreviado = mes_abreviado.lower()
                # Criar uma string de data no formato "DDmesDDmes" (por exemplo, "03abril09abril")
                data = f"{inicio_dia}{mes_abreviado}{fim_dia}{mes_abreviado}"

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

@app.route('/process', methods=['POST'])
def process():
    """
    Performs a web scraping action when the user clicks the button.
    """
    try:
        # Web scraping logic
        website_url = 'https://ru.ufsc.br/ru/'  # Replace with the desired website URL
        response = requests.get(website_url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Example: Extract text from the first paragraph (<p>) found on the website
        extracted_text = soup.find('p').get_text()

        return render_template('index.html', result=f"Action successful! Extracted text: {extracted_text}")

    except Exception as e:
        return render_template('index.html', result=f"Action failed: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True)
