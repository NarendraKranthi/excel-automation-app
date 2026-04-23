const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

// ✅ Upload & preview API
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    res.json(data);
  } catch (err) {
    res.status(500).send("Error reading file");
  }
});

// ✅ Generate EOD + Multi-sheet Excel
app.post("/generate", upload.single("file"), (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    let summary = {};

    data.forEach(row => {
      const coder = row["Coder Name"];
      const status = row["Status"];

      if (!summary[coder]) {
        summary[coder] = { completed: 0, pending: 0 };
      }

      if (status === "Completed" || status === "Completd") {
        summary[coder].completed++;
      } else {
        summary[coder].pending++;
      }
    });

    const eodSheet = Object.keys(summary).map(coder => ({
      "Coder Name": coder,
      "Completed": summary[coder].completed,
      "Pending": summary[coder].pending
    }));

    const completedData = data.filter(r =>
      r["Status"] === "Completed" || r["Status"] === "Completd"
    );

    const holdData = data.filter(r =>
      r["Status"] !== "Completed" && r["Status"] !== "Completd"
    );

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(eodSheet), "EOD Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(completedData), "Completed");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(holdData), "Pending");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=EOD_Report.xlsx");
    res.send(buffer);

  } catch (err) {
    res.status(500).send("Error generating Excel");
  }
});

// ✅ Start server
app.listen(5000, () => console.log("Server running on port 5000"));
