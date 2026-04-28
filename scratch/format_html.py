import sys
from bs4 import BeautifulSoup

def format_html(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Use BeautifulSoup to re-format
    # But be careful with script contents
    soup = BeautifulSoup(content, 'html.parser')
    formatted = soup.prettify()
    
    with open(filename, 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(formatted)

if __name__ == "__main__":
    format_html(sys.argv[1])
