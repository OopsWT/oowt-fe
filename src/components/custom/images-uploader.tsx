"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { MediaFile } from "@/lib/types";
import imageCompression from "browser-image-compression";

interface ImagesUploaderProps {
  initialImages?: MediaFile[];
  onChange: (filesToUpload: File[], preservedImages: MediaFile[]) => void;
  onWeightExceeded?: (isExceeded: boolean) => void;
}

const MAX_PAYLOAD_SIZE_MB = 4.5;

export default function ImagesUploader({
  onChange,
  initialImages = [],
  onWeightExceeded,
}: ImagesUploaderProps) {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [preservedImages, setPreservedImages] =
    useState<MediaFile[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [totalCompressedSize, setTotalCompressedSize] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    onChange(filesToUpload, preservedImages);
  }, [filesToUpload, preservedImages, onChange]);

  useEffect(() => {
    const objectUrls = filesToUpload.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [filesToUpload]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setLoading(true);
    setUploadError(null); // Clear previous errors

    const files = Array.from(e.target.files);

    // Compress images before adding
    const compressedFiles: File[] = [];
    for (const file of files) {
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
        });
        compressedFiles.push(compressed as File);
      } catch (err) {
        console.error("Error compressig images:", err);
        compressedFiles.push(file);
      }
    }

    // Calculate total size of all compressed files (new and existing)
    const currentTotalSize = [...filesToUpload, ...compressedFiles].reduce(
      (acc, file) => acc + file.size,
      0
    );
    const currentTotalSizeMB = currentTotalSize / (1024 * 1024);

    if (currentTotalSizeMB > MAX_PAYLOAD_SIZE_MB) {
      setUploadError(
        `Rozmiar plików (${currentTotalSizeMB.toFixed(
          2
        )} MB) przekracza limit ${MAX_PAYLOAD_SIZE_MB} MB.`
      );
      setLoading(false);
      onWeightExceeded?.(true); // Notify parent about weight limit exceeded
      return;
    }

    setTotalCompressedSize(currentTotalSizeMB);
    const merged = [...filesToUpload, ...compressedFiles];
    setFilesToUpload(merged);
    setLoading(false);
    onWeightExceeded?.(false); // Notify parent that weight is within limits
  };

  const removeServerImage = (id: number) => {
    setPreservedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeNewImage = (index: number) => {
    setFilesToUpload((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      const updatedTotalSize = newFiles.reduce(
        (acc, file) => acc + file.size,
        0
      );
      const updatedTotalSizeMB = updatedTotalSize / (1024 * 1024);
      setTotalCompressedSize(updatedTotalSizeMB);
      setUploadError(null); // Clear error if size is now within limits
      if (updatedTotalSizeMB <= MAX_PAYLOAD_SIZE_MB) {
        onWeightExceeded?.(false); // Notify parent that weight is within limits
      }
      return newFiles;
    });
  };

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm space-y-4">
      <div>
        <Label htmlFor="images" className="text-base mb-2">
          Załaduj zdjęcia
        </Label>
        <Input
          id="images"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
          className="block w-full text-sm text-gray-500 h-14
            file:mr-4 file:mt-2 file:px-4 file:py-0 file:rounded-md file:border-0 file:cursor-pointer
            file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 
            hover:file:bg-blue-100"
        />
        {uploadError && (
          <p className="text-red-500 text-sm mt-2">{uploadError}</p>
        )}
        {!uploadError && totalCompressedSize > 0 && (
          <p className="text-gray-600 text-sm mt-2">
            Wielkość dodanych plików: {totalCompressedSize.toFixed(2)} MB /{" "}
            {MAX_PAYLOAD_SIZE_MB} MB
          </p>
        )}
        {loading && (
          <div className="w-full h-30 flex items-center justify-center">
            <Loader2 className="mr-2 h-9 w-9 animate-spin" />
            <p className="text-sm text-gray-500">Dodawanie zdjęć...</p>
          </div>
        )}
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((url, index) => (
            <Card
              key={index}
              className="relative group overflow-hidden rounded-2xl h-60 pt-0 pb-0"
            >
              <CardContent className="p-0 my-auto">
                <Image
                  src={url}
                  alt={`Preview ${index}`}
                  className="w-full object-contain rounded-2xl !my-auto"
                  width={300}
                  height={300}
                />
              </CardContent>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeNewImage(index)}
                className="absolute top-2 right-2 bg-white/70 hover:bg-white text-red-600 hover:text-red-700
                  shadow transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Server images */}
      {preservedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {preservedImages.map((img) => (
            <Card
              key={img.id}
              className="relative group overflow-hidden rounded-2xl h-60 pt-0 pb-0"
            >
              <CardContent className="p-0 my-auto">
                <Image
                  src={img.url}
                  alt={img.name || `Image ${img.id}`}
                  className="w-full object-contain rounded-2xl !my-auto"
                  width={300}
                  height={300}
                />
              </CardContent>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeServerImage(img.id)}
                className="absolute top-2 right-2 bg-white/70 hover:bg-white text-red-600 hover:text-red-700
                  shadow transition-opacity opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
