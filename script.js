function showTab(tabName) {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");
  tabs.forEach(tab => tab.classList.remove("active"));
  contents.forEach(content => content.classList.remove("active"));
  document.querySelector(`.tab[onclick="showTab('${tabName}')"]`).classList.add("active");
  document.getElementById(`${tabName}-tab`).classList.add("active");
}

document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch("http://127.0.0.1:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("timetable-section").style.display = "block";
    document.getElementById("user-label").textContent = username;
    loadCourses();
  } else {
    alert("Login failed.");
  }
});

document.getElementById("register-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("new-username").value.trim();
  const password = document.getElementById("new-password").value.trim();

  const res = await fetch("http://127.0.0.1:5000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    alert("Registered! Now log in.");
    showTab("login");
  } else if (res.status === 409) {
    alert("Username already exists.");
  } else {
    alert("Registration failed.");
  }
});

async function loadCourses() {
  const res = await fetch("http://127.0.0.1:5000/api/courses");
  const courses = await res.json();
  const select = document.getElementById("course-select");
  select.innerHTML = "";
  courses.forEach(course => {
    const opt = document.createElement("option");
    opt.value = course.id;
    opt.textContent = course.name;
    select.appendChild(opt);
  });
  select.addEventListener("change", loadTimetable);
  loadTimetable();
}

async function loadTimetable() {
  const courseId = document.getElementById("course-select").value;
  if (!courseId) return;
  const res = await fetch(`http://127.0.0.1:5000/api/timetable/${courseId}`);
  const timetable = await res.json();
  const tbody = document.querySelector("#timetable-table tbody");
  const isStudent = document.getElementById("user-label").textContent === "Student";
  tbody.innerHTML = "";

  // Set header visibility
  const actionsHeader = document.querySelector(".actions-header");
  actionsHeader.style.display = isStudent ? "none" : "table-cell";

  timetable.forEach(entry => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.day}</td>
      <td>${entry.time}</td>
      <td>${entry.subject}</td>
      <td>${entry.room}</td>
      <td>${entry.capacity}</td>
      <td>${entry.availability}</td>
      ${isStudent ? "" : `
        <td class="actions-cell">
          <button class="edit" onclick='editEntry(${JSON.stringify(entry)})'>Edit</button>
          <button class="delete" onclick="deleteEntry(${entry.id})">Delete</button>
        </td>
      `}
    `;
    tbody.appendChild(tr);
  });
}



function editEntry(entry) {
  document.getElementById("entry-id").value = entry.id;
  document.getElementById("day").value = entry.day;
  document.getElementById("time").value = entry.time;
  document.getElementById("subject").value = entry.subject;
  document.getElementById("room").value = entry.room;
  document.getElementById("capacity").value = entry.capacity;
  document.getElementById("availability").value = entry.availability;
}

async function deleteEntry(id) {
  if (!confirm("Are you sure?")) return;
  const res = await fetch(`http://127.0.0.1:5000/api/timetable/${id}`, { method: "DELETE" });
  if (res.ok) loadTimetable();
  else alert("Delete failed.");
}

document.getElementById("timetable-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const id = document.getElementById("entry-id").value;
  const data = {
    course_id: document.getElementById("course-select").value,
    day: document.getElementById("day").value,
    time: document.getElementById("time").value,
    subject: document.getElementById("subject").value,
    room: document.getElementById("room").value,
    capacity: document.getElementById("capacity").value,
    availability: document.getElementById("availability").value
  };
  const res = await fetch(`http://127.0.0.1:5000/api/timetable${id ? '/' + id : ''}`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    alert("Saved!");
    document.getElementById("timetable-form").reset();
    document.getElementById("entry-id").value = "";
    loadTimetable();
  }
});

document.getElementById("course-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("course-name").value;
  const res = await fetch("http://127.0.0.1:5000/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  if (res.ok) {
    alert("Course added.");
    document.getElementById("course-form").reset();
    loadCourses();
  }
});

function studentView() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("timetable-section").style.display = "block";
  document.getElementById("user-label").textContent = "Student";

  // Hide forms
  document.getElementById("timetable-form").style.display = "none";
  document.getElementById("course-form").style.display = "none";

  // Hide the headers
  document.querySelector("h3:nth-of-type(1)").style.display = "none"; // Manage Timetable
  document.querySelector("h3:nth-of-type(2)").style.display = "none"; // Add New Course

  // Change logout to back
  document.getElementById("back-button").textContent = "Back";

  // Hide actions header
  const actionsHeader = document.querySelector(".actions-header");
  if (actionsHeader) actionsHeader.style.display = "none";

  loadCourses();
}


function goBack() {
  document.getElementById("timetable-section").style.display = "none";
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("timetable-form").style.display = "flex";
  document.getElementById("course-form").style.display = "flex";
  document.querySelector("h3:nth-of-type(1)").style.display = "block"; // Manage Timetable
  document.querySelector("h3:nth-of-type(2)").style.display = "block"; // Add New Course
  document.getElementById("back-button").textContent = "Logout";
  const actionsHeader = document.querySelector(".actions-header");
  if (actionsHeader) actionsHeader.style.display = "table-cell";
}

