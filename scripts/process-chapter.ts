
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Usage: ts-node scripts/process-chapter.ts <input_dir> <output_dir>');
    process.exit(1);
}

const inputDir = args[0];
const outputDir = args[1];

if (!fs.existsSync(inputDir)) {
    console.error(`Input directory does not exist: ${inputDir}`);
    process.exit(1);
}

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function processImages() {
    try {
        const files = fs.readdirSync(inputDir);

        // Filter and sort files based on the pattern "imgi_{number}_"
        const imageFiles = files
            .filter(file => /imgi_\d+_/.test(file) && /\.(jpg|jpeg|png)$/i.test(file))
            .map(file => {
                const match = file.match(/imgi_(\d+)_/);
                return {
                    file,
                    number: match ? parseInt(match[1], 10) : 0
                };
            })
            .sort((a, b) => a.number - b.number);

        if (imageFiles.length === 0) {
            console.log('No matching images found in input directory.');
            console.log('Expected pattern: imgi_{number}_... (jpg/jpeg/png)');
            return;
        }

        console.log(`Found ${imageFiles.length} images. Processing...`);

        for (let i = 0; i < imageFiles.length; i++) {
            const { file } = imageFiles[i];
            const inputPath = path.join(inputDir, file);
            // Zero-pad filenames: 001.webp, 002.webp, etc.
            const newFilename = `${String(i + 1).padStart(3, '0')}.webp`;
            const outputPath = path.join(outputDir, newFilename);

            await sharp(inputPath)
                .webp({ quality: 80 }) // 80 is a good balance for manga
                .toFile(outputPath);

            console.log(`Processed: ${file} -> ${newFilename}`);
        }

        console.log('✅ Processing complete!');
        console.log(`Output directory: ${outputDir}`);

    } catch (error) {
        console.error('Error processing images:', error);
    }
}

processImages();
