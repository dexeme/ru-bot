from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

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
