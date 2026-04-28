import sys
import re
from collections import Counter

def audit_html(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    errors = []
    
    # 1. Duplicate IDs
    ids = re.findall(r'id=["\'](.*?)["\']', content)
    counts = Counter(ids)
    for id_val, count in counts.items():
        if count > 1:
            errors.append(f"Duplicate ID: '{id_val}' ({count} occurrences)")
            
    # 2. Unquoted attributes or missing space between attributes
    # Check for things like <div class="a"id="b">
    spacing_issues = re.findall(r'[a-zA-Z0-9]+="[^"]*"[a-zA-Z0-9]+=', content)
    for issue in spacing_issues:
        errors.append(f"Missing space between attributes: {issue}")
        
    # 3. Mismatched quotes in attributes
    # This is hard with regex, but we can check for common patterns
    
    # 4. Empty attributes that might cause issues
    empty_attrs = re.findall(r'\s+[a-zA-Z0-9]+=["\']["\']', content)
    # Some empty attributes are fine (like class=""), so maybe ignore this.
    
    return errors

if __name__ == "__main__":
    errs = audit_html(sys.argv[1])
    if not errs:
        print("No audit issues found.")
    for e in errs:
        print(e)
