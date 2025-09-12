from flask import Flask, render_template, jsonify, send_from_directory, request
from flask_cors import CORS
import os, json

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

DATA_FILE = os.path.join(app.root_path, 'data', 'movies.json')

# 🔹 Home Page
@app.route('/')
def home():
    return render_template('index.html')

# 🔹 Section Page with Pagination
@app.route('/sections/<int:page>')
def section_page(page):
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sections = data.get("sections", [])
    total_pages = (len(sections) + 2) // 3  # 3 sections per page

    start_index = (page - 1) * 3
    end_index = start_index + 3
    current_sections = sections[start_index:end_index]

    # Pagination range logic (max 5 buttons)
    start = max(1, page - 2)
    end = min(total_pages, start + 4)
    page_range = list(range(start, end + 1))

    return render_template("section_page.html",
                           current_page=page,
                           total_pages=total_pages,
                           page_range=page_range,
                           sections=current_sections)

# 🔹 API Endpoint (Optional)
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
        return jsonify(data)

# 🔹 Serve Static Images
@app.route('/img/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(app.static_folder, 'img'), filename)

# 🔹 Run App
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)