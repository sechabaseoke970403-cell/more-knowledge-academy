from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# TEMP DATABASES
users = []
tutors = []
bookings = []


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


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/tutor_dashboard")
def tutor_dashboard():
    return render_template("tutor_dashboard.html")


# ===================== AUTH =====================

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    users.append({
        "username": data["username"],
        "password": data["password"],
        "role": data["role"]
    })

    return jsonify({"message": "Account created!"})


@app.route("/login_user", methods=["POST"])
def login_user():
    data = request.json

    for user in users:
        if user["username"] == data["username"] and user["password"] == data["password"]:
            return jsonify({
                "message": "Login successful",
                "role": user["role"]
            })

    return jsonify({"message": "Invalid login"})


# ===================== TUTORS =====================

@app.route("/add_tutor", methods=["POST"])
def add_tutor():
    data = request.json

    tutor = {
        "name": data["name"],
        "subject": data["subject"],
        "price": data["price"],
        "bio": data["bio"]
    }

    tutors.append(tutor)

    return jsonify({"message": "Tutor profile created"})


@app.route("/get_tutors")
def get_tutors():
    return jsonify(tutors)


# ===================== BOOKINGS =====================

@app.route("/book_lesson", methods=["POST"])
def book_lesson():
    data = request.json

    booking = {
        "tutor": data["tutor"],
        "student": data["student"],
        "date": data["date"],
        "time": data["time"]
    }

    bookings.append(booking)

    return jsonify({"message": "Lesson booked successfully"})


@app.route("/get_bookings")
def get_bookings():
    return jsonify(bookings)


# ===================== PAYMENTS =====================

@app.route("/pay", methods=["POST"])
def pay():
    data = request.json

    amount = float(data["amount"])

    tutor_share = amount * 0.7
    platform_share = amount * 0.3

    return jsonify({
        "message": "Payment processed",
        "tutor_gets": tutor_share,
        "platform_gets": platform_share
    })


# ===================== RUN =====================

if __name__ == "__main__":
    app.run(debug=True)