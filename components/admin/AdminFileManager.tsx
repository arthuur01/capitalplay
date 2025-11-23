"use client";

import { useState, useEffect } from "react";
import { storage } from "@/firebaseConfig";
import { ref, listAll, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, FileText, Upload } from "lucide-react";

interface FileItem {
  name: string;
  url: string;
  fullPath: string;
}

export function AdminFileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const DIRECTORY_PATH = "uploads/";

  const fetchFiles = async () => {
    const listRef = ref(storage, DIRECTORY_PATH);
    try {
      const res = await listAll(listRef);
      const filePromises = res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url,
          fullPath: itemRef.fullPath,
        };
      });
      const fileList = await Promise.all(filePromises);
      setFiles(fileList);
    } catch (error) {
      console.error("Erro ao listar arquivos:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const storageRef = ref(storage, `${DIRECTORY_PATH}${file.name}`);
    
    setUploading(true);
    try {
      await uploadBytes(storageRef, file);
      alert("Upload realizado com sucesso!");
      fetchFiles();
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fullPath: string) => {
    if (!confirm("Tem certeza que deseja excluir este arquivo?")) return;
    
    const fileRef = ref(storage, fullPath);
    try {
      await deleteObject(fileRef);
      alert("Arquivo excluído!");
      fetchFiles();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir arquivo.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciador de Arquivos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/10">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              type="file"
              onChange={handleUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
          </div>
          {uploading && <span className="text-sm text-muted-foreground animate-pulse">Enviando...</span>}
        </div>

        <div className="space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum arquivo encontrado.</p>
          ) : (
            files.map((file) => (
              <div key={file.fullPath} className="flex items-center justify-between p-3 border rounded hover:bg-secondary/10 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium truncate hover:underline">
                    {file.name}
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(file.fullPath)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
