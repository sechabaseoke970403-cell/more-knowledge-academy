from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import requests

app = Flask(__name__)
app.secret_key = "CHANGE_THIS_TO_A_RANDOM_SECRET_KEY"

app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# ===================== DATABASE =====================

def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tutors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        subject TEXT,
        price REAL,
        bio TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tutor TEXT,
        student TEXT,
        date TEXT,
        time TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tutor TEXT,
        amount REAL,
        status TEXT,
        payment_id TEXT
    )
    """)

    conn.commit()
    conn.close()

# ===================== PAGES =====================

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/login")
def login_page():
    return render_template("login.html")


@app.route("/tutors")
def tutors_page():
    return render_template("tutors.html")


@app.route("/booking")
def booking_page():
    return render_template("booking.html")


@app.route("/payment")
def payment_page():
    return render_template("payment.html")


@app.route("/payment_success")
def payment_success():
    return "Payment received. Waiting for confirmation..."


@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect(url_for("login_page"))
    return render_template("dashboard.html")


@app.route("/tutor_dashboard")
def tutor_dashboard():
    if "user" not in session or session.get("role") != "tutor":
        return redirect(url_for("login_page"))
    return render_template("tutor_dashboard.html")

# ===================== AUTH =====================

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    username = data.get("username", "").strip()
    password = data.get("password", "")
    role = data.get("role", "")

    if not username or not password:
        return jsonify({"message": "Username and password required"})

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"message": "User already exists"})

    hashed_password = generate_password_hash(password)

    cursor.execute(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        (username, hashed_password, role)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Account created!"})


@app.route("/login_user", methods=["POST"])
def login_user():
    data = request.json

    username = data.get("username")
    password = data.get("password")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    user = cursor.fetchone()

    conn.close()

    if user and check_password_hash(user["password"], password):
        session["user"] = user["username"]
        session["role"] = user["role"]

        return jsonify({
            "message": "Login successful",
            "role": user["role"]
        })

    return jsonify({"message": "Invalid login"})


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login_page"))

# ===================== TUTORS =====================

@app.route("/add_tutor", methods=["POST"])
def add_tutor():
    data = request.json

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO tutors (name, subject, price, bio) VALUES (?, ?, ?, ?)",
        (data["name"], data["subject"], data["price"], data["bio"])
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Tutor added!"})


@app.route("/get_tutors")
def get_tutors():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM tutors")
    rows = cursor.fetchall()

    tutors = []
    for r in rows:
        tutors.append({
            "name": r["name"],
            "subject": r["subject"],
            "price": r["price"],
            "bio": r["bio"]
        })

    conn.close()
    return jsonify(tutors)

# ===================== BOOKINGS =====================

@app.route("/book_lesson", methods=["POST"])
def book_lesson():
    data = request.json

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO bookings (tutor, student, date, time) VALUES (?, ?, ?, ?)",
        (data["tutor"], data["student"], data["date"], data["time"])
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Lesson booked!"})


@app.route("/get_bookings")
def get_bookings():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM bookings")
    rows = cursor.fetchall()

    bookings = []
    for b in rows:
        bookings.append({
            "tutor": b["tutor"],
            "student": b["student"],
            "date": b["date"],
            "time": b["time"]
        })

    conn.close()
    return jsonify(bookings)

@app.route("/get_payments")
def get_payments():

    # 🔐 Optional: protect admin-only
    if "user" not in session:
        return jsonify([])

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM payments WHERE status='PAID'")
    rows = cursor.fetchall()

    payments = []

    for p in rows:
        amount = float(p["amount"])

        payments.append({
            "tutor": p["tutor"],
            "amount": amount,
            "tutor_earns": round(amount * 0.7, 2),
            "platform_earns": round(amount * 0.3, 2)
        })

    conn.close()
    return jsonify(payments)

# ===================== PAYMENTS =====================

@app.route("/pay", methods=["POST"])
def pay():
    data = request.json

    amount = data.get("amount")
    tutor = data.get("tutor")

    payment_id = f"{tutor}_{amount}"

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO payments (tutor, amount, status, payment_id) VALUES (?, ?, ?, ?)",
        (tutor, amount, "PENDING", payment_id)
    )

    conn.commit()
    conn.close()

    merchant_id = "10000100"
    merchant_key = "46f0cd694581a"

    payment_url = (
        payment_url = (
    "https://www.payfast.co.za/eng/process?"
        f"merchant_id={merchant_id}&"
        f"merchant_key={merchant_key}&"
        f"amount={amount}&"
        f"item_name=Tutor Payment for {tutor}&"
        f"custom_str1={payment_id}&"
        f"return_url=http://127.0.0.1:5000/payment_success&"
        f"cancel_url=http://127.0.0.1:5000/payment&"
        f"notify_url=http://127.0.0.1:5000/itn"
    )

    return jsonify({"payment_url": payment_url})


@app.route("/itn", methods=["POST"])
def itn():
    data = request.form.to_dict()
    print("ITN DATA:", data)

    pf_verify_url = "https://sandbox.payfast.co.za/eng/query/validate"
    response = requests.post(pf_verify_url, data=data)

    if response.text != "VALID":
        print("❌ INVALID ITN")
        return "INVALID"

    print("✅ PayFast VERIFIED")

    payment_status = data.get("payment_status")
    payment_id = data.get("custom_str1")

    if payment_status == "COMPLETE":
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE payments SET status=? WHERE payment_id=?",
            ("PAID", payment_id)
        )

        conn.commit()
        conn.close()

        print("✅ PAYMENT SAVED")

    return "OK"
@app.route("/admin")
def admin_dashboard():
    if "user" not in session or session.get("role") != "admin":
        return redirect(url_for("login_page"))

    return render_template("admin.html")
# ===================== RUN =====================

if __name__ == "__main__":
    init_db()
    app.run()
