import express from 'express';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '..', 'public', 'data', 'lyrics.json');
const PORT = process.env['LYRICS_SERVER_PORT'] || 4300;

function isValidSong(song) {
  return (
    song &&
    typeof song.id === 'string' &&
    typeof song.title === 'string' &&
    typeof song.artist === 'string' &&
    typeof song.lyrics === 'string'
  );
}

const app = express();
app.use(express.json({ limit: '5mb' }));

app.get('/api/songs', async (_req, res) => {
  try {
    const raw = await readFile(DATA_FILE, 'utf-8');
    res.json(JSON.parse(raw));
  } catch {
    res.json([]);
  }
});

app.put('/api/songs', async (req, res) => {
  const songs = req.body;
  if (!Array.isArray(songs) || !songs.every(isValidSong)) {
    res.status(400).json({ error: 'Payload inválido: esperado um array de músicas.' });
    return;
  }

  await mkdir(dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, `${JSON.stringify(songs, null, 2)}\n`, 'utf-8');
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Lyrics file server rodando em http://localhost:${PORT}`);
  console.log(`Gravando em ${DATA_FILE}`);
});
