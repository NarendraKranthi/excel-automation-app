const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    res.json(data);
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.listen(5000, () => console.log("Server running"));
