import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const pickerOptions = { quality: 0.6, allowsEditing: true, aspect: [3, 4] as [number, number] };

async function ensureLibraryPermission(): Promise<boolean> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Photos unavailable', 'Allow photo library access in Settings to add your pieces.');
    return false;
  }
  return true;
}

export async function pickImage(fromCamera: boolean): Promise<string | null> {
  let result: ImagePicker.ImagePickerResult;
  if (fromCamera) {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera unavailable', 'Allow camera access in Settings to photograph your pieces.');
      return null;
    }
    result = await ImagePicker.launchCameraAsync(pickerOptions);
  } else {
    if (!(await ensureLibraryPermission())) return null;
    result = await ImagePicker.launchImageLibraryAsync({ ...pickerOptions, mediaTypes: ['images'] });
  }
  if (!result.canceled && result.assets[0]) return result.assets[0].uri;
  return null;
}

export async function pickImages(limit = 8): Promise<string[]> {
  if (!(await ensureLibraryPermission())) return [];
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.6,
    allowsMultipleSelection: true,
    selectionLimit: limit,
  });
  if (result.canceled) return [];
  return result.assets.map((asset) => asset.uri);
}
