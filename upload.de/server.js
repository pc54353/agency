// server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/files", (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: "Fehler beim Lesen" });
    res.json(files);
  });
});

app.post("/upload", upload.single("file"), (req, res) => {
  const fileUrl = "/uploads/" + req.file.filename;
  io.emit("new-file", fileUrl);
  res.json({ success: true, url: fileUrl });
});

io.on("connection", (socket) => {
  console.log("👤 Ein neuer Nutzer ist verbunden");
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log("🚀 Server läuft auf http://localhost:" + PORT);
});