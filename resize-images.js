import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesDir = './public/images';
const backupDir = './public/images/originals';

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Images to resize with their target dimensions based on gallery grid
const imagesToResize = [
  {
    input: 'download-2.jpg',
    output: 'gal1.jpg',
    width: 800,
    height: 800,
    position: 'large' // 3x3 grid cells
  },
  {
    input: 'download-3.jpg',
    output: 'gal2.jpg',
    width: 500,
    height: 800,
    position: 'tall' // 3x2 grid cells
  },
  {
    input: 'download-5.jpg',
    output: 'gal3.jpg',
    width: 800,
    height: 500,
    position: 'wide' // 2x3 grid cells
  },
  {
    input: 'download-6.jpg',
    output: 'gal4.jpg',
    width: 500,
    height: 500,
    position: 'medium' // 2x2 grid cells
  }
];

async function resizeImages() {
  console.log('🖼️  Starting image resize process...\n');

  for (const img of imagesToResize) {
    const inputPath = path.join(imagesDir, img.input);
    const outputPath = path.join(imagesDir, img.output);
    const backupPath = path.join(backupDir, img.input);

    try {
      // Check if input file exists
      if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  Skipping ${img.input} - file not found`);
        continue;
      }

      // Backup original if not already backed up
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(inputPath, backupPath);
        console.log(`💾 Backed up: ${img.input}`);
      }

      // Resize image
      await sharp(inputPath)
        .resize(img.width, img.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath + '.tmp');

      // Replace original with resized
      fs.renameSync(outputPath + '.tmp', outputPath);

      console.log(`✅ Resized: ${img.input} → ${img.output} (${img.width}x${img.height} - ${img.position})`);
    } catch (error) {
      console.error(`❌ Error processing ${img.input}:`, error.message);
    }
  }

  console.log('\n✨ Image resize complete! Originals backed up to public/images/originals/');
}

resizeImages();
