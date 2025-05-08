from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_chart', methods=['POST'])
def generate_chart():
    data = request.get_json()
    # 这里只需返回数据，实际图表生成在前端完成
    return jsonify(data)

if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=8030, debug=True)
    app.run(host="0.0.0.0", debug=True)