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
  const relPath = path.relative("public/images", filePath).replace(/\\/g, "/");
  const isCover = /vd-.*-cover/i.test(filePath);
  const isMaterialOrCategory = relPath.startsWith("product/") || relPath.startsWith("category/");

  const inputBuf = fs.readFileSync(filePath);
  let meta;
  try {
    meta = await sharp(inputBuf).metadata();
  } catch {
    return { skipped: true };
  }

  let pipeline = sharp(inputBuf);
  let wasResized = false;

  // Keep material and category images sharp for 1:1 mobile and desktop displays (max 1280px)
  if (isMaterialOrCategory && !isCover) {
    if ((meta.width && meta.width > 1280) || (meta.height && meta.height > 1280)) {
      pipeline = pipeline.resize({
        width: 1280,
        height: 1280,
        fit: "inside",
        withoutEnlargement: true,
      });
      wasResized = true;
    }
  } else if (isCover) {
    if (meta.width && meta.width > 1600) {
      pipeline = pipeline.resize({
        width: 1600,
        fit: "inside",
        withoutEnlargement: true,
      });
      wasResized = true;
    }
  }

  if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: 85, effort: 4 });
  } else if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
  } else if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9, effort: 7 });
  } else {
    return { skipped: true };
  }

  const optBuf = await pipeline.toBuffer();
  if (optBuf.length < origSize || wasResized) {
    fs.writeFileSync(filePath, optBuf);
    return {
      success: true,
      origSize,
      newSize: optBuf.length,
      saved: Math.max(0, origSize - optBuf.length),
      dim: `${meta.width}x${meta.height}`,
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

  console.log("Scanning public/images for material & category images to optimize (resizing to max 600px)...");
  const allFiles = getFiles(imgDir);
  const supportedExts = [".webp", ".jpg", ".jpeg", ".png"];

  const targets = allFiles.filter((f) => {
    const ext = path.extname(f.path).toLowerCase();
    if (!supportedExts.includes(ext)) return false;
    const rel = path.relative("public/images", f.path).replace(/\\/g, "/");
    // All product (material) and category images
    if (rel.startsWith("product/") || rel.startsWith("category/")) {
      return true;
    }
    // Other images > 200KB
    return f.size > 200 * 1024;
  });

  console.log(`Found ${targets.length} images to inspect/optimize.`);
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
        const pct = res.origSize > res.newSize ? ((1 - res.newSize / res.origSize) * 100).toFixed(0) : "0";
        if (optimizedCount % 25 === 0 || i === targets.length - 1) {
          console.log(
            `[${i + 1}/${targets.length}] ${path.relative("public", item.path)}: ${(res.origSize / 1024).toFixed(0)}KB -> ${(res.newSize / 1024).toFixed(0)}KB (-${pct}%)`
          );
        }
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
