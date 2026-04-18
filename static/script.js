// ADD TUTOR
console.log("JS LOADED")

function addTutor(){

const name=document.getElementById("name").value
const subject=document.getElementById("subject").value
const price=document.getElementById("price").value
const bio=document.getElementById("bio").value

fetch("/add_tutor",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

name:name,
subject:subject,
price:price,
bio:bio

})

})

.then(res=>res.json())

.then(data=>{

alert(data.message)

})

}



// LOAD TUTOR MARKETPLACE
function loadTutorMarketplace(){

const container=document.getElementById("tutorContainer")

if(!container) return

fetch("/get_tutors")

.then(res=>res.json())

.then(data=>{

container.innerHTML=""

data.forEach(tutor=>{

const card=document.createElement("div")

card.className="tutorCard"

card.innerHTML=`

<h3>${tutor.name}</h3>
<p><b>Subject:</b> ${tutor.subject}</p>
<p><b>Rate:</b> $${tutor.price}/hour</p>
<p>${tutor.bio}</p>

<button onclick="bookTutor('${tutor.name}')">
Book Lesson
</button>

`

container.appendChild(card)

})

})

}



// LOAD SIMPLE TUTOR LIST
function loadTutors() {

const list = document.getElementById("tutorList")

if(!list) return

fetch('/get_tutors')

.then(response => response.json())

.then(data => {

list.innerHTML = ""

data.forEach(tutor => {

const li = document.createElement("li")

li.textContent = tutor.name + " - " + tutor.subject

list.appendChild(li)

})

})

}



// SIGNUP
function signup(){

const username = document.getElementById("username").value
const password = document.getElementById("password").value
const role = document.getElementById("role").value

fetch("/signup",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

username:username,
password:password,
role:role

})

})

.then(res=>res.json())

.then(data=>{

document.getElementById("message").innerText=data.message

})

}



// LOGIN
function login(){

const username = document.getElementById("username").value
const password = document.getElementById("password").value

fetch("/login_user",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

username:username,
password:password

})

})

.then(res=>res.json())

.then(data=>{

document.getElementById("message").innerText=data.message

})

}



// BOOK LESSON
function bookLesson(){

const tutor = localStorage.getItem("selectedTutor")
const student = document.getElementById("studentName").value
const date = document.getElementById("date").value
const time = document.getElementById("time").value

fetch("/book_lesson",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

tutor:tutor,
student:student,
date:date,
time:time

})

})

.then(res=>res.json())

.then(data=>{

document.getElementById("bookingMessage").innerText=data.message

})

}



// SELECT TUTOR AND GO TO BOOKING PAGE
function bookTutor(name){

localStorage.setItem("selectedTutor", name)

window.location.href="/booking"

}



// PAGE LOAD FUNCTIONS

window.onload = function(){

loadTutorMarketplace()
loadTutors()
loadBookings()
loadTutorBookings()

const tutor = localStorage.getItem("selectedTutor")
const tutorLabel = document.getElementById("tutorName")

if(tutor && tutorLabel){
tutorLabel.innerText = "Tutor: " + tutor
}

}

function loadBookings(){

const container = document.getElementById("bookingContainer")

if(!container) return

fetch("/get_bookings")

.then(res=>res.json())

.then(data=>{

container.innerHTML=""

data.forEach(b=>{

const div=document.createElement("div")

div.className="tutorCard"

div.innerHTML=`

<h3>${b.tutor}</h3>
<p><b>Student:</b> ${b.student}</p>
<p><b>Date:</b> ${b.date}</p>
<p><b>Time:</b> ${b.time}</p>

`

container.appendChild(div)

})

})

}

function payNow(){

const tutor = localStorage.getItem("selectedTutor")
const student = document.getElementById("studentName").value
const amount = document.getElementById("amount").value

fetch("/pay",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

tutor:tutor,
student:student,
amount:amount

})

})

.then(res=>res.json())

.then(data=>{

document.getElementById("paymentMessage").innerText =
"Tutor earns: $" + data.tutor_earns +
" | Platform earns: $" + data.platform_earns

})

}

function loadTutorBookings(){

const tutor = localStorage.getItem("selectedTutor")

const container = document.getElementById("tutorBookings")
const title = document.getElementById("tutorTitle")

if(!container) return

title.innerText = "Welcome, " + tutor

fetch("/get_bookings")

.then(res=>res.json())

.then(data=>{

container.innerHTML=""

data.forEach(b=>{

if(b.tutor === tutor){

const card=document.createElement("div")

card.className="tutorCard"

card.innerHTML=`

<h3>${b.student}</h3>
<p><b>Date:</b> ${b.date}</p>
<p><b>Time:</b> ${b.time}</p>

`

container.appendChild(card)

}

})

})

}