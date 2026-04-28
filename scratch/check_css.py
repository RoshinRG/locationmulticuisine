import os
import re

def check_css(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for unbalanced braces
    open_braces = content.count('{')
    close_braces = content.count('}')
    
    if open_braces != close_braces:
        print(f"Error in {filepath}: Unbalanced braces! {{: {open_braces}, }}: {close_braces}")
    
    # Check for missing semicolons (simple check)
    # This might have false positives but can find obvious issues
    lines = content.split('\n')
    for i, line in enumerate(lines):
        line = line.strip()
        if line and not line.endswith('{') and not line.endswith('}') and not line.endswith(';') and not line.startswith('@') and not line.startswith('/') and not line.startswith('*'):
            print(f"Potential missing semicolon in {filepath} at line {i+1}: {line}")

if __name__ == "__main__":
    import sys
    for root, dirs, files in os.walk(sys.argv[1]):
        for file in files:
            if file.endswith('.css'):
                check_css(os.path.join(root, file))
