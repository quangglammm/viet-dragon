import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push({ path: fullPath, size: stat.size });
    }
  }
  return results;
}

sharp.cache(false);

async function optimizeImage(filePath, origSize) {
  const ext = path.extname(filePath).toLowerCase();
  const inputBuf = fs.readFileSync(filePath);
  let pipeline = sharp(inputBuf);

  if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: 82, effort: 4 });
  } else if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  } else if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9, effort: 7 });
  } else {
    return { skipped: true };
  }

  const optBuf = await pipeline.toBuffer();
  if (optBuf.length < origSize) {
    fs.writeFileSync(filePath, optBuf);
    return {
      success: true,
      origSize,
      newSize: optBuf.length,
      saved: origSize - optBuf.length,
    };
  }

  return { skipped: true, origSize, newSize: origSize };
}

async function main() {
  const imgDir = path.resolve("public/images");
  if (!fs.existsSync(imgDir)) {
    console.error("public/images does not exist.");
    process.exit(1);
  }

  console.log("Scanning public/images for images > 200KB...");
  const allFiles = getFiles(imgDir);
  const supportedExts = [".webp", ".jpg", ".jpeg", ".png"];
  const targets = allFiles.filter(
    (f) => supportedExts.includes(path.extname(f.path).toLowerCase()) && f.size > 200 * 1024
  );

  console.log(`Found ${targets.length} images to optimize.`);
  let totalOrig = 0;
  let totalNew = 0;
  let optimizedCount = 0;

  for (let i = 0; i < targets.length; i++) {
    const item = targets[i];
    try {
      const res = await optimizeImage(item.path, item.size);
      if (res.success) {
        totalOrig += res.origSize;
        totalNew += res.newSize;
        optimizedCount++;
        const pct = ((1 - res.newSize / res.origSize) * 100).toFixed(0);
        console.log(
          `[${i + 1}/${targets.length}] ${path.relative("public", item.path)}: ${(res.origSize / 1024).toFixed(0)}KB -> ${(res.newSize / 1024).toFixed(0)}KB (-${pct}%)`
        );
      }
    } catch (err) {
      console.error(`Failed ${item.path}:`, err.message);
    }
  }

  console.log("\n=================================");
  console.log(`Optimized ${optimizedCount}/${targets.length} files.`);
  console.log(`Original total: ${(totalOrig / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Optimized total: ${(totalNew / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Saved: ${((totalOrig - totalNew) / (1024 * 1024)).toFixed(2)} MB`);
  console.log("=================================\n");
}

main().catch(console.error);
