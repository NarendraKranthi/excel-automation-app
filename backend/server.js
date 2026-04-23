app.post("/generate", upload.single("file"), (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // 👉 EOD Summary Logic
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

    // 👉 Process Sheets
    const completedData = data.filter(r => r["Status"] === "Completed" || r["Status"] === "Completd");
    const holdData = data.filter(r => r["Status"] !== "Completed" && r["Status"] !== "Completd");

    // 👉 Create Workbook
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(eodSheet);
    const ws2 = XLSX.utils.json_to_sheet(completedData);
    const ws3 = XLSX.utils.json_to_sheet(holdData);

    XLSX.utils.book_append_sheet(wb, ws1, "EOD Summary");
    XLSX.utils.book_append_sheet(wb, ws2, "Completed");
    XLSX.utils.book_append_sheet(wb, ws3, "Pending");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=EOD_Report.xlsx");
    res.send(buffer);

  } catch (err) {
    res.status(500).send("Error generating Excel");
  }
});
