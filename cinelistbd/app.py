from flask import Flask, render_template, jsonify, send_from_directory, request
import os, json

app = Flask(__name__, static_folder='static', template_folder='templates')
DATA_FILE = os.path.join(app.root_path, 'data', 'movies.json')

@app.route('/')
def home():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    home_sections = ["trending", "recent", "latest"]
    sections = []
    for key in home_sections:
        sections.append({
            "title": key.replace("-", " ").title(),
            "id": key,
            "movies": data.get(key, [])
        })

    # ✅ Calculate pagination info for other sections
    all_keys = [k for k in data.keys() if k not in home_sections]
    total_pages = (len(all_keys) + 2) // 3
    page_range = list(range(1, total_pages + 1))

    return render_template("index.html",
                           sections=sections,
                           current_page=1,
                           total_pages=total_pages,
                           page_range=page_range)

@app.route('/sections/<int:page>')
def section_page(page):
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    all_keys = [k for k in data.keys() if k not in ["trending", "recent", "latest"]]
    total_pages = (len(all_keys) + 2) // 3
    start = (page - 1) * 3
    end = start + 3
    current_keys = all_keys[start:end]

    sections = []
    for key in current_keys:
        sections.append({
            "title": key.replace("-", " ").title(),
            "id": key,
            "movies": data.get(key, [])
        })

    page_range = list(range(max(1, page - 2), min(total_pages, page + 2) + 1))

    return render_template("index.html",
                           sections=sections,
                           current_page=page,
                           total_pages=total_pages,
                           page_range=page_range)

@app.route('/api/movies')
def movies_api():
    section = request.args.get('section')
    offset = int(request.args.get('offset', 0))
    limit = int(request.args.get('limit', 20))

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if section and section in data:
        sliced = data[section][offset:offset + limit]
        return jsonify({'movies': sliced})
    else:
        return jsonify({'movies': []})

@app.route('/img/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(app.static_folder, 'img'), filename)

if __name__ == '__main__':
    app.run(debug=True)