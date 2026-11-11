
import { Directory, File, Paths } from 'expo-file-system';

// Create a permanent folder for imported documents
const documentsDirectory = new Directory(
  Paths.document,
  'DocuNestFiles'
);

// Copy an imported file into DocuNest storage
export async function savePickedFile(asset) {
  try {
    // Create the folder if it does not exist
    documentsDirectory.create({
      idempotent: true,
      intermediates: true,
    });

    const originalName = asset.name || `document-${Date.now()}`;

    // Make the filename safe
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Generate a unique filename
    const uniqueName = `${Date.now()}-${safeName}`;

    const sourceFile = new File(asset.uri);

    const destinationFile = new File(
      documentsDirectory,
      uniqueName
    );

    // Copy the selected file into permanent app storage
    await sourceFile.copy(destinationFile);

    return {
      fileUri: destinationFile.uri,
      fileSize: destinationFile.size || asset.size || 0,
    };
  } catch (error) {
    console.error('File storage error:', error);
    throw error;
  }
}

// Delete an imported file from local storage
export function removeStoredFile(fileUri) {
  if (!fileUri) return;

  const file = new File(fileUri);

  if (file.exists) {
    file.delete();
  }
}
