from flask import Flask, render_template, jsonify, send_from_directory
from flask_cors import CORS
import os, json

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'movies.json')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/details/<int:movie_id>')
def details(movie_id):
    return render_template('details.html', movie_id=movie_id)

@app.route('/api/movies')
def api_movies():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data["movies"])

@app.route('/static/img/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(app.root_path, 'static', 'img'), filename)

if __name__ == '__main__':
    app.run(debug=True)