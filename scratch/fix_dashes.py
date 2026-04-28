import os

def fix_dashes(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.html'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace en-dash and em-dash
                new_content = content.replace('–', '-').replace('—', '-')
                
                if content != new_content:
                    print(f"Fixed dashes in {path}")
                    with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
                        f.write(new_content)

if __name__ == "__main__":
    import sys
    fix_dashes(sys.argv[1])
