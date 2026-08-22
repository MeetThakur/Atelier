import { Image } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const MAX_WIDTH = 1080;
const JPEG_QUALITY = 0.75;

async function compress(uri: string): Promise<string> {
  const { width } = await new Promise<{ width: number; height: number }>((resolve, reject) =>
    Image.getSize(uri, (w, h) => resolve({ width: w, height: h }), reject),
  );
  if (width <= MAX_WIDTH) return uri;
  const context = ImageManipulator.manipulate(uri).resize({ width: MAX_WIDTH });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
  return saved.uri;
}

export async function storeImage(uri: string, id: string): Promise<string> {
  const closetDir = new Directory(Paths.document, 'closet');
  if (!closetDir.exists) closetDir.create({ idempotent: true });
  const dest = new File(closetDir, `${id}.jpg`);
  if (dest.exists) dest.delete();
  const source = await compress(uri);
  await new File(source).copy(dest);
  return dest.uri;
}

export function deleteStoredImage(uri: string): void {
  if (!uri.startsWith('file://')) return;
  try { new File(uri).delete(); } catch {}
}
