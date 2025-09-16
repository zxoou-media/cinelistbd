from flask import Flask, render_template, jsonify, send_from_directory, request
import os, json

app = Flask(__name__, static_folder='static', template_folder='templates')
DATA_FILE = os.path.join(app.root_path, 'data', 'movies.json')

# ✅ Load JSON once at startup for performance
with open(DATA_FILE, 'r', encoding='utf-8') as f:
    MOVIE_DATA = json.load(f)

HOME_SECTIONS = ["trending", "recent", "latest"]

# ✅ Home Page: Static Sections Only
@app.route('/')
def home():
    sections = []
    for key in HOME_SECTIONS:
        if key in MOVIE_DATA:
            sections.append({
                "title": key.replace("-", " ").title(),
                "id": key,
                "movies": MOVIE_DATA[key]
            })

    # Pagination info for dynamic sections
    all_keys = [k for k in MOVIE_DATA.keys() if k not in HOME_SECTIONS]
    total_pages = (len(all_keys) + 2) // 3
    page_range = list(range(1, total_pages + 1))

    return render_template("index.html",
                           sections=sections,
                           current_page=0,
                           total_pages=total_pages,
                           page_range=page_range)

# ✅ Dynamic Section Pages
@app.route('/sections/<int:page>')
def section_page(page):
    all_keys = [k for k in MOVIE_DATA.keys() if k not in HOME_SECTIONS]
    total_pages = (len(all_keys) + 2) // 3
    start = (page - 1) * 3
    end = start + 3
    current_keys = all_keys[start:end]

    sections = []
    for key in current_keys:
        sections.append({
            "title": key.replace("-", " ").title(),
            "id": key,
            "movies": MOVIE_DATA.get(key, [])
        })

    page_range = list(range(max(1, page - 2), min(total_pages, page + 2) + 1))

    return render_template("index.html",
                           sections=sections,
                           current_page=page,
                           total_pages=total_pages,
                           page_range=page_range)

# ✅ API Endpoint for JS Fetch
@app.route('/api/movies')
def movies_api():
    section = request.args.get('section')
    offset = int(request.args.get('offset', 0))
    limit = min(int(request.args.get('limit', 20)), 50)  # ✅ Cap limit to 50

    if not section or section not in MOVIE_DATA:
        return jsonify({'error': 'Invalid section', 'movies': []}), 400

    sliced = MOVIE_DATA[section][offset:offset + limit]
    return jsonify({'movies': sliced})

# ✅ Serve Poster Images
@app.route('/img/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(app.static_folder, 'img'), filename)

if __name__ == '__main__':
    app.run(debug=True)