from flask import Flask, render_template, jsonify, send_from_directory, request
from flask_cors import CORS
import os, json

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

DATA_FILE = os.path.join(app.root_path, 'data', 'movies.json')

def load_data():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/')
def home():
    data = load_data()
    return render_template('index.html',
        trending=data.get('trending', []),
        recent=data.get('recent', [])[:20],
        latest=data.get('latest', [])[:20],
        popular=data.get('popular', [])[:20]
    )

@app.route('/section/<key>')
def section_page(key):
    valid_keys = ['recent', 'latest', 'popular']
    if key not in valid_keys:
        return "Section not found", 404
    return render_template('section.html', section=key)

@app.route('/api/section/<key>')
def section_api(key):
    page = int(request.args.get("page", 1))
    per_page = 20
    data = load_data()
    section_data = data.get(key, [])
    start = (page - 1) * per_page
    end = start + per_page
    return jsonify({
        "movies": section_data[start:end],
        "total": len(section_data)
    })

@app.route('/api/movies')
def movies_api():
    return jsonify(load_data())

@app.route('/img/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(app.static_folder, 'img'), filename)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)