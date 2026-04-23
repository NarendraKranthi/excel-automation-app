const BASE_URL = "https://excel-automation-app-jjkx.onrender.com";

// 📤 Upload & Preview Excel Data
async function upload() {
const fileInput = document.getElementById("fileInput");
const file = fileInput.files[0];

if (!file) {
alert("Please select a file first");
return;
}

const formData = new FormData();
formData.append("file", file);

try {
const res = await fetch(BASE_URL + "/upload", {
method: "POST",
body: formData
});

const data = await res.json();
displayTable(data);

} catch (err) {
alert("Error uploading file");
console.error(err);
}
}

// 📊 Display data in table
function displayTable(data) {
const table = document.getElementById("table");
table.innerHTML = "";

if (!data.length) {
table.innerHTML = "<tr><td>No data found</td></tr>";
return;
}

const headers = Object.keys(data[0]);

// Header row
let headerRow = "<tr>";
headers.forEach(h => headerRow += "<th>${h}</th>");
headerRow += "</tr>";
table.innerHTML += headerRow;

// Data rows
data.forEach(row => {
let rowHtml = "<tr>";
headers.forEach(h => rowHtml += "<td>${row[h] || ""}</td>");
rowHtml += "</tr>";
table.innerHTML += rowHtml;
});
}

// 📥 Generate EOD Multi-sheet Excel
async function generate() {
const fileInput = document.getElementById("fileInput");
const file = fileInput.files[0];

if (!file) {
alert("Please select a file first");
return;
}

const formData = new FormData();
formData.append("file", file);

try {
const res = await fetch(BASE_URL + "/generate", {
method: "POST",
body: formData
});

if (!res.ok) {
  throw new Error("Failed to generate report");
}

const blob = await res.blob();

// Download file
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "EOD_Report.xlsx";
document.body.appendChild(a);
a.click();
a.remove();

} catch (err) {
alert("Error generating report");
console.error(err);
}
}
