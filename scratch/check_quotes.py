import sys

def check_quotes(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            # Very naive check: even number of double and single quotes
            # But ignore lines with single quotes used for apostrophes if it's a comment
            if line.count('"') % 2 != 0:
                print(f"Double quote mismatch at line {i+1}: {line.strip()}")
            # Single quotes are trickier because of JS strings and apostrophes
            # if line.count("'") % 2 != 0:
            #    print(f"Single quote mismatch at line {i+1}: {line.strip()}")

if __name__ == "__main__":
    check_quotes(sys.argv[1])
