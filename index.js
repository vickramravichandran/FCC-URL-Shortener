require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;

const shortUrlMap = {};

app.use(cors());

app.use("/api/shorturl", bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url || "";
  console.log(url);

  const valid = url.startsWith("http://") || url.startsWith("https://");
  if (!valid) {
    res.json({ error: "invalid url" });
    return;
  }

  const hostname = parseHostname(url);
  if (!hostname) {
    res.json({ error: "invalid url" });
    return;
  }

  dns.lookup(hostname, (err, address) => {
    if (err) {
      res.json({ error: "invalid url" });
    } else {
      const shortUrl = Object.keys(shortUrlMap).length + 1;
      shortUrlMap[shortUrl] = url;
      res.json({ original_url: url, short_url: shortUrl });
    }
  });
});

app.get("/api/shorturl/:surl?", function (req, res) {
  const shortUrl = req.params.surl || "";
  const originalUrl = shortUrlMap[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "not found" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

function parseHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    console.log(e);
    return "";
  }
}
