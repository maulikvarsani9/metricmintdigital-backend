import fs from 'fs';
import path from 'path';

const folders = [
  'uploads',
  'uploads/blog',
  'uploads/authors',
];

export const createFolders = (): void => {
  folders.forEach(folder => {
    const folderPath = path.join(process.cwd(), folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`Created folder: ${folder}`);
    }
  });
};

