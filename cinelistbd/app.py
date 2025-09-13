from flask import Flask, render_template, jsonify, send_from_directory, request, redirect, url_for
from flask_cors import CORS
import os, json

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

DATA_FILE = os.path.join(app.root_path, 'data', 'movies.json')

# 🔹 Redirect root to first paginated section
@app.route('/')
def home():
    return redirect(url_for('section_page', page=1))

# 🔹 Paginated section rendering
@app.route('/sections/<int:page>')
def section_page(page):
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sections = data.get("sections", [])
    total_pages = (len(sections) + 2) // 3  # Show 3 sections per page

    start_index = (page - 1) * 3
    end_index = start_index + 3
    current_sections = sections[start_index:end_index]

    start = max(1, page - 2)
    end = min(total_pages, start + 4)
    page_range = list(range(start, end + 1))

    return render_template("index.html",
                           sections=current_sections,
                           current_page=page,
                           total_pages=total_pages,
                           page_range=page_range)

# 🔹 API for JS-based lazy loading
@app.route('/api/movies')
def movies_api():
    section = request.args.get('section')
    offset = int(request.args.get('offset', 0))
    limit = int(request.args.get('limit', 20))

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # If using new structure: data["sections"] → list of dicts
    if "sections" in data:
        for sec in data["sections"]:
            if sec["title"].lower().replace(" ", "") == section:
                sliced = sec["movies"][offset:offset + limit]
                return jsonify({'movies': sliced})
        return jsonify({'movies': []})
    else:
        # Legacy structure
        if section and section in data:
            sliced = data[section][offset:offset + limit]
            return jsonify({'movies': sliced})
        else:
            return jsonify(data)

# 🔹 Serve poster images
@app.route('/img/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(app.static_folder, 'img'), filename)

# 🔹 Run app
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)