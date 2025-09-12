from flask import Flask, render_template, redirect, url_for, request, jsonify
import os, json

app = Flask(__name__, static_folder='static', template_folder='templates')

DATA_FILE = os.path.join(app.root_path, 'data', 'movies.json')

@app.route('/')
def home():
    return redirect(url_for('section_page', page=1))

@app.route('/sections/<int:page>')
def section_page(page):
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sections = data.get("sections", [])
    total_pages = (len(sections) + 2) // 3

    start_index = (page - 1) * 3
    end_index = start_index + 3
    current_sections = sections[start_index:end_index]

    start = max(1, page - 2)
    end = min(total_pages, start + 4)
    page_range = list(range(start, end + 1))

    return render_template("section_page.html",
                           current_page=page,
                           total_pages=total_pages,
                           page_range=page_range,
                           sections=current_sections)