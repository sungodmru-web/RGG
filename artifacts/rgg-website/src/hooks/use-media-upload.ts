import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { requestMediaUploadUrl, registerMediaUpload } from "@/lib/adminApi";
import type { Media } from "@/types/admin";

interface UseMediaUploadProps {
  purpose: "publication-pdf" | "publication-image" | "endorsement-portrait" | "general";
  onSuccess?: (media: Media) => void;
  onError?: (error: Error) => void;
}

export function useMediaUpload({ purpose, onSuccess, onError }: UseMediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    
    try {
      // 1. Request presigned URL
      const { uploadURL, objectPath } = await requestMediaUploadUrl({
        name: file.name,
        size: file.size,
        contentType: file.type,
        purpose,
      });

      // 2. Upload to storage using XMLHttpRequest for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error("Network error during upload"));
        
        xhr.open("PUT", uploadURL);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // 3. Register media
      const media = await registerMediaUpload({
        name: file.name,
        size: file.size,
        contentType: file.type,
        purpose,
        objectPath,
      });

      toast({
        title: "Upload complete",
        description: `${file.name} has been uploaded successfully.`,
      });

      if (onSuccess) {
        onSuccess(media);
      }
      
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Upload failed");
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
      if (onError) onError(error);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return {
    uploadFile,
    isUploading,
    progress,
    triggerUpload,
    fileInputRef,
  };
}