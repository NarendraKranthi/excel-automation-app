async function upload() {
  const file = document.getElementById("fileInput").files[0];
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:5000/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  showTable(data);
}

function showTable(data) {
  const table = document.getElementById("table");
  table.innerHTML = "";

  if (!data.length) return;

  const headers = Object.keys(data[0]);

  let row = "<tr>";
  headers.forEach(h => row += `<th>${h}</th>`);
  row += "</tr>";
  table.innerHTML += row;

  data.forEach(d => {
    let r = "<tr>";
    headers.forEach(h => r += `<td>${d[h] || ""}</td>`);
    r += "</tr>";
    table.innerHTML += r;
  });
}
