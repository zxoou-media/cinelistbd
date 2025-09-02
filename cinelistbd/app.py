from flask import Flask, render_template, jsonify, request
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/details/<int:movie_id>')
def details(movie_id):
    with open('data/movies.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    movie = next((m for m in data["movies"] if m["id"] == movie_id), None)
    return render_template('details.html', movie=movie)

@app.route('/api/movies')
def get_movies():
    with open('data/movies.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data["movies"])

if __name__ == '__main__':
    app.run(debug=True)