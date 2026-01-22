
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const testDir = path.join(process.cwd(), 'scripts', 'test-input');

if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
}

async function createDummyImages() {
    console.log('Creating dummy images...');

    // Create dummy images with messy names
    const files = [
        'imgi_1_messyName.jpg',
        'imgi_10_messyName.jpg',
        'imgi_2_messyName.png'
    ];

    for (const file of files) {
        await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: { r: 255, g: 0, b: 0 }
            }
        })
            .jpeg()
            .toFile(path.join(testDir, file));
    }

    console.log('Dummy images created at:', testDir);
}

createDummyImages();
