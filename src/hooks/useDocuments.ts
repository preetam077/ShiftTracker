'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Document,
  getDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  renameDocument,
} from '@/lib/documents';
import { useAuth } from '@/contexts/AuthContext';

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const docs = await getDocuments(user.id);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = useCallback(
    async (file: File, displayName: string) => {
      if (!user) return;
      setUploading(true);
      try {
        await uploadDocument(file, displayName, user.id);
        await load();
      } finally {
        setUploading(false);
      }
    },
    [user, load]
  );

  const download = useCallback(async (doc: Document) => {
    await downloadDocument(doc);
  }, []);

  const remove = useCallback(
    async (doc: Document) => {
      await deleteDocument(doc);
      await load();
    },
    [load]
  );

  const rename = useCallback(
    async (id: string, newName: string) => {
      await renameDocument(id, newName);
      await load();
    },
    [load]
  );

  return {
    documents,
    loading,
    uploading,
    upload,
    download,
    remove,
    rename,
    reload: load,
  };
}
