from flask import Flask, request, jsonify, g
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'jobs.db')

app = Flask(__name__)
CORS(app)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

def init_db():
    db = sqlite3.connect(DB_PATH)
    cur = db.cursor()
    cur.execute('''
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL,
        location TEXT,
        url TEXT,
        notes TEXT,
        date_applied TEXT,
        created_at TEXT NOT NULL
    )
    ''')
    db.commit()
    db.close()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def row_to_dict(row):
    return {k: row[k] for k in row.keys()}

@app.route('/api/applications', methods=['GET'])
def list_applications():
    status = request.args.get('status')
    q = request.args.get('q')
    db = get_db()
    sql = 'SELECT * FROM applications'
    params = []
    clauses = []
    if status:
        clauses.append('status = ?')
        params.append(status)
    if q:
        clauses.append('(company LIKE ? OR role LIKE ? OR notes LIKE ?)')
        qparam = f"%{q}%"
        params.extend([qparam, qparam, qparam])
    if clauses:
        sql += ' WHERE ' + ' AND '.join(clauses)
    sql += ' ORDER BY created_at DESC'
    cur = db.execute(sql, params)
    rows = cur.fetchall()
    return jsonify([row_to_dict(r) for r in rows])

@app.route('/api/applications', methods=['POST'])
def create_application():
    data = request.get_json() or {}
    now = datetime.utcnow().isoformat()
    fields = ['company','role','status','location','url','notes','date_applied']
    values = [data.get(f) for f in fields]
    db = get_db()
    cur = db.cursor()
    cur.execute('''INSERT INTO applications (company,role,status,location,url,notes,date_applied,created_at)
                   VALUES (?,?,?,?,?,?,?,?)''', (*values, now))
    db.commit()
    app_id = cur.lastrowid
    cur = db.execute('SELECT * FROM applications WHERE id = ?', (app_id,))
    return jsonify(row_to_dict(cur.fetchone())), 201

@app.route('/api/applications/<int:app_id>', methods=['PUT'])
def update_application(app_id):
    data = request.get_json() or {}
    allowed = ['company','role','status','location','url','notes','date_applied']
    updates = []
    params = []
    for k in allowed:
        if k in data:
            updates.append(f"{k} = ?")
            params.append(data[k])
    if not updates:
        return jsonify({'error':'no fields to update'}), 400
    params.append(app_id)
    db = get_db()
    db.execute(f"UPDATE applications SET {', '.join(updates)} WHERE id = ?", params)
    db.commit()
    cur = db.execute('SELECT * FROM applications WHERE id = ?', (app_id,))
    row = cur.fetchone()
    if not row:
        return jsonify({'error':'not found'}), 404
    return jsonify(row_to_dict(row))

@app.route('/api/applications/<int:app_id>', methods=['DELETE'])
def delete_application(app_id):
    db = get_db()
    cur = db.execute('SELECT * FROM applications WHERE id = ?', (app_id,))
    if not cur.fetchone():
        return jsonify({'error':'not found'}), 404
    db.execute('DELETE FROM applications WHERE id = ?', (app_id,))
    db.commit()
    return jsonify({'success': True})

@app.route('/api/stats', methods=['GET'])
def stats():
    db = get_db()
    cur = db.execute('SELECT COUNT(*) as total FROM applications')
    total = cur.fetchone()['total']
    cur = db.execute("SELECT status, COUNT(*) as count FROM applications GROUP BY status")
    rows = cur.fetchall()
    counts = {r['status']: r['count'] for r in rows}
    applied = counts.get('Applied', 0)
    responses = total - applied
    response_rate = (responses / total) * 100 if total > 0 else 0
    return jsonify({
        'total': total,
        'counts': counts,
        'response_rate': round(response_rate, 1)
    })

init_db()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
