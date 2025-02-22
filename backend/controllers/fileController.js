const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const DATA_DIR = path.join(__dirname, "../data");

exports.getFiles = (req, res) => {
  try {
    const folder = req.query.folder || "";
    const directoryPath = path.join(DATA_DIR, folder);

    if (!fs.existsSync(directoryPath) || !fs.lstatSync(directoryPath).isDirectory()) {
      return res.status(404).json({ error: "Directory not found" });
    }

    const files = fs.readdirSync(directoryPath).map(file => ({
      name: file,
      isDirectory: fs.lstatSync(path.join(directoryPath, file)).isDirectory(),
    }));

    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Error reading directory" });
  }
};

exports.getFileContent = (req, res) => {
  try {
    const { filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }

    const fullPath = path.join(DATA_DIR, filePath);

    if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isFile()) {
      return res.status(404).json({ error: "File not found" });
    }

    const mimeType = mime.lookup(fullPath) || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${path.basename(fullPath)}"`);

    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error streaming file:", error);
    res.status(500).json({ error: "Error streaming file" });
  }
};

const searchFilesRecursive = (dir, query, basePath = "", results = []) => {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    const isDirectory = fs.lstatSync(fullPath).isDirectory();

    if (item.toLowerCase().includes(query.toLowerCase())) {
      results.push({ name: item, isDirectory, path: relativePath });
    }

    if (isDirectory) {
      searchFilesRecursive(fullPath, query, relativePath, results);
    }
  });

  return results;
};

exports.searchFiles = (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Search query is required." });
  }

  try {
    const results = searchFilesRecursive(DATA_DIR, query);
    res.json(results);
  } catch (error) {
    console.error("Error searching files:", error.message);
    res.status(500).json({ error: "Error searching files." });
  }
};