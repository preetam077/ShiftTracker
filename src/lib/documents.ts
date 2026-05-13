import { supabase } from './supabase';

export interface Document {
  id: string;
  userId: string;
  name: string;           // User-given display name
  fileName: string;       // Original file name
  fileSize: number;       // Bytes
  mimeType: string;
  storagePath: string;    // Path in Supabase Storage
  createdAt: string;
}

interface DocumentRow {
  id: string;
  user_id: string;
  name: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
}

const BUCKET = 'documents';

function rowToDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    storagePath: row.storage_path,
    createdAt: row.created_at,
  };
}

// ---------- CRUD ----------

export async function getDocuments(userId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }

  return (data as DocumentRow[]).map(rowToDocument);
}

export async function uploadDocument(
  file: File,
  displayName: string,
  userId: string
): Promise<Document> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const ext = file.name.split('.').pop() || 'bin';
  const storagePath = `${userId}/${id}.${ext}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw uploadError;
  }

  // Save metadata to database
  const row: DocumentRow = {
    id,
    user_id: userId,
    name: displayName,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type || 'application/octet-stream',
    storage_path: storagePath,
    created_at: new Date().toISOString(),
  };

  const { error: dbError } = await supabase
    .from('documents')
    .insert(row);

  if (dbError) {
    // Rollback: remove uploaded file
    await supabase.storage.from(BUCKET).remove([storagePath]);
    console.error('Error saving document metadata:', dbError);
    throw dbError;
  }

  return rowToDocument(row);
}

export async function downloadDocument(doc: Document): Promise<void> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(doc.storagePath);

  if (error || !data) {
    console.error('Error downloading file:', error);
    throw error || new Error('No data returned');
  }

  // Trigger browser download
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function deleteDocument(doc: Document): Promise<void> {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([doc.storagePath]);

  if (storageError) {
    console.error('Error deleting file from storage:', storageError);
    throw storageError;
  }

  // Delete metadata
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', doc.id);

  if (dbError) {
    console.error('Error deleting document metadata:', dbError);
    throw dbError;
  }
}

export async function renameDocument(id: string, newName: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ name: newName })
    .eq('id', id);

  if (error) {
    console.error('Error renaming document:', error);
    throw error;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(mimeType: string): 'pdf' | 'image' | 'document' | 'spreadsheet' | 'other' {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'spreadsheet';
  return 'other';
}
