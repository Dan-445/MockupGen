import os
from flask import Flask, jsonify, send_file

app = Flask(__name__)

@app.route('/readme', methods=['GET'])
def read_readme():
    readme_path = os.path.join(os.path.dirname(__file__), 'README.md')
    if not os.path.exists(readme_path):
        return jsonify({'error': 'README.md not found'}), 404
    with open(readme_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return jsonify({'content': content})

if __name__ == '__main__':
    # Run on port 5000, accessible locally
    app.run(host='0.0.0.0', port=5000)
