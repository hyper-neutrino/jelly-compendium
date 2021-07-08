from page_generators import *

from flask import Flask, abort, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def serve_root():
    return render_template("index.html")

@app.route("/codepage")
def serve_codepage():
    return render_template("codepage.html", codepage = codepage)

@app.route("/codepage/<int:index>")
def serve_charpage(index):
    if index == 32:
        return render_template("spacepage.html")
    if index == 127:
        return render_template("newlinepage.html")
    if 0 <= index < 256:
        char = codepage[index]
        return render_template("charpage.html", data = charmap[char], char = char)
    abort(404)

@app.route("/misc/<id>")
def serve_misc(id):
    return render_template(f"misc/{id}.html")

@app.route("/<category>/<id>")
def serve_category(category, id):
    if category not in ["atoms", "quicks", "syntax"]:
        abort(404)
    if id not in data[category]:
        abort(404)
    return render_template(f"{category}.html", codepage = codepage, data = data[category][id])

@app.route("/search")
def serve_search():
    return render_template("search.html", data = sorted([{**item, "type": category} for category, values in data.items() for item in values.values()], key = lambda x: list(map(codepage.find, x["symbol"]))), tags = sorted({tag for category in ["atoms", "quicks", "syntax"] for item in data[category].values() for tag in item["tags"]}), taginfo = tags)

@app.errorhandler(404)
def serve_404(e):
    return render_template("404.html")

if __name__ == "__main__":
    app.run()
