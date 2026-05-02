console.log("JS LOADED")

// ===================== ADD TUTOR =====================
function addTutor(){

    const name = document.getElementById("name").value
    const subject = document.getElementById("subject").value
    const price = document.getElementById("price").value
    const bio = document.getElementById("bio").value

    fetch("/add_tutor",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ name, subject, price, bio })
    })
    .then(res=>res.json())
    .then(data=>{
        alert(data.message)
        loadTutorMarketplace()
    })
}


// ===================== LOAD MARKETPLACE =====================
function loadTutorMarketplace(){

    const container = document.getElementById("tutorContainer")
    if(!container) return

    fetch("/get_tutors")
    .then(res=>res.json())
    .then(data=>{

        container.innerHTML = ""

        if(data.length === 0){
            container.innerHTML = "<p>No tutors available yet.</p>"
            return
        }

        data.forEach(tutor=>{
            const card=document.createElement("div")
            card.className="tutorCard"

            card.innerHTML = `
                <h3>${tutor.name}</h3>
                <p><b>Subject:</b> ${tutor.subject}</p>
                <p><b>Rate:</b> R${tutor.price}/hour</p>
                <p>${tutor.bio}</p>
                <button onclick="bookTutor('${tutor.name}', '${tutor.price}')">Book Lesson</button>
            `

            container.appendChild(card)
        })
    })
}


// ===================== SIMPLE LIST =====================
function loadTutors(){

    const list = document.getElementById("tutorList")
    if(!list) return

    fetch('/get_tutors')
    .then(res=>res.json())
    .then(data=>{
        list.innerHTML=""

        data.forEach(tutor=>{
            const li=document.createElement("li")
            li.textContent = tutor.name + " - " + tutor.subject
            list.appendChild(li)
        })
    })
}


// ===================== SIGNUP =====================
function signup(){

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const role = document.getElementById("role").value

    fetch("/signup",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ username, password, role })
    })
    .then(res=>res.json())
    .then(data=>{
        document.getElementById("message").innerText = data.message
    })
}


// ===================== LOGIN =====================
function login(){

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    fetch("/login_user",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ username, password })
    })
    .then(res=>res.json())
    .then(data=>{

        document.getElementById("message").innerText = data.message

        if(data.message === "Login successful"){

            localStorage.setItem("loggedInUser", username)

            if(data.role === "tutor"){
                window.location.href = "/tutor_dashboard"
            } else {
                window.location.href = "/dashboard"
            }
        }
    })
}


// ===================== LOGOUT =====================
function logout(){
    window.location.href = "/logout"
}


// ===================== BOOK LESSON =====================
function bookLesson(){

    const tutor = localStorage.getItem("selectedTutor")
    const student = document.getElementById("studentName").value
    const date = document.getElementById("date").value
    const time = document.getElementById("time").value

    fetch("/book_lesson",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ tutor, student, date, time })
    })
    .then(res=>res.json())
    .then(data=>{
        document.getElementById("bookingMessage").innerText = data.message
    })
}


// ===================== SELECT TUTOR =====================
function bookTutor(name, price){

    localStorage.setItem("selectedTutor", name)
    localStorage.setItem("selectedPrice", price)

    window.location.href="/payment"
}


// ===================== PAYMENT DETAILS =====================
function loadPaymentDetails(){

    const tutor = localStorage.getItem("selectedTutor")
    const price = localStorage.getItem("selectedPrice")

    const tutorEl = document.getElementById("tutorName")
    const amountEl = document.getElementById("amount")

    if(tutorEl) tutorEl.innerText = tutor
    if(amountEl) amountEl.innerText = price
}


// ===================== PAYMENT INFO =====================
function loadPaymentInfo(){

    const price = parseFloat(localStorage.getItem("selectedPrice"))
    const info = document.getElementById("paymentInfo")

    if(!price || !info) return

    const tutorEarn = price * 0.7
    const platformEarn = price * 0.3

    info.innerText =
        "Tutor earns: R" + tutorEarn +
        " | Platform earns: R" + platformEarn
}


// ===================== PAY =====================
function payNow(){

    const tutor = localStorage.getItem("selectedTutor")
    const amount = localStorage.getItem("selectedPrice")

    fetch("/pay",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ tutor, amount })
    })
    .then(res=>res.json())
    .then(data=>{
        window.location.href = data.payment_url
    })
}


// ===================== BOOKINGS =====================
function loadBookings(){

    const container = document.getElementById("bookingContainer")
    if(!container) return

    fetch("/get_bookings")
    .then(res=>res.json())
    .then(data=>{

        container.innerHTML=""

        data.forEach(b=>{
            const card=document.createElement("div")
            card.className="tutorCard"

            card.innerHTML=`
                <h3>${b.tutor}</h3>
                <p><b>Student:</b> ${b.student}</p>
                <p><b>Date:</b> ${b.date}</p>
                <p><b>Time:</b> ${b.time}</p>
            `

            container.appendChild(card)
        })
    })
}

function loadAdminDashboard(){

    const list = document.getElementById("paymentList")
    const totalEl = document.getElementById("totalEarnings")

    if(!list || !totalEl) return

    fetch("/get_payments")
    .then(res=>res.json())
    .then(data=>{

        list.innerHTML = ""
        let total = 0

        if(data.length === 0){
            list.innerHTML = "<p>No payments yet.</p>"
            return
        }

        data.forEach(p=>{

            total += p.platform_earns

            const div = document.createElement("div")
            div.className = "tutorCard"

            div.innerHTML = `
                <h3>${p.tutor}</h3>
                <p><b>Total Paid:</b> R${p.amount}</p>
                <p><b>Tutor Gets:</b> R${p.tutor_earns}</p>
                <p><b>Platform Gets:</b> R${p.platform_earns}</p>
            `

            list.appendChild(div)
        })

        totalEl.innerText = "R" + total
    })
}


// ===================== PAGE LOAD =====================
window.onload = function(){
    loadTutorMarketplace()
    loadTutors()
    loadPaymentInfo()
    loadBookings()
    loadPaymentDetails()
    loadAdminDashboard()
}
