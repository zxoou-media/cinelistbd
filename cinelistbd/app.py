from flask import Flask, render_template, jsonify, send_from_directory
from flask_cors import CORS
import os, json

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

DATA_FILE = os.path.join(app.root_path, 'data', 'movies.json')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/movies')
def movies_api():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)

@app.route('/img/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(app.static_folder, 'img'), filename)

@app.route('/section/<key>')
def section_page(key):
    valid_keys = ['recent', 'latest', 'movies', 'webseries', 'drama']
    if key not in valid_keys:
        return render_template('404.html'), 404
    return render_template('section.html', section=key)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)