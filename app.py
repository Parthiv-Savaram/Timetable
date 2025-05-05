from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '12345678',  # <-- change to your MySQL password
    'database': 'university'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = %s", (data['username'],))
    if cursor.fetchone():
        return jsonify({"error": "User exists"}), 409
    cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (data['username'], data['password']))
    conn.commit()
    return jsonify({"message": "Registered"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (data['username'], data['password']))
    user = cursor.fetchone()
    if user:
        return jsonify({"status": "ok"})
    return jsonify({"error": "Invalid"}), 401

@app.route('/api/courses', methods=['GET', 'POST'])
def courses():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    if request.method == 'GET':
        cursor.execute("SELECT * FROM courses")
        result = cursor.fetchall()
    else:
        data = request.json
        cursor.execute("INSERT INTO courses (name) VALUES (%s)", (data['name'],))
        conn.commit()
        result = {"message": "Course added"}
    return jsonify(result)

@app.route('/api/timetable/<int:course_id>', methods=['GET'])
def get_timetable(course_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM timetable WHERE course_id = %s", (course_id,))
    data = cursor.fetchall()
    return jsonify(data)

@app.route('/api/timetable', methods=['POST'])
def add_entry():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO timetable (course_id, day, time, subject, room, capacity, availability) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (data['course_id'], data['day'], data['time'], data['subject'], data['room'], data['capacity'], data['availability'])
    )
    conn.commit()
    return jsonify({"message": "Added"}), 201

@app.route('/api/timetable/<int:entry_id>', methods=['PUT'])
def update_entry(entry_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE timetable SET day=%s, time=%s, subject=%s, room=%s, capacity=%s, availability=%s WHERE id=%s",
        (data['day'], data['time'], data['subject'], data['room'], data['capacity'], data['availability'], entry_id)
    )
    conn.commit()
    return jsonify({"message": "Updated"})

@app.route('/api/timetable/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM timetable WHERE id = %s", (entry_id,))
    conn.commit()
    return jsonify({"message": "Deleted"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
