"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { MediaFile } from "@/lib/types";
import imageCompression from "browser-image-compression";

interface ImagesUploaderProps {
  initialImages?: MediaFile[];
  onChange: (filesToUpload: File[], preservedImages: MediaFile[]) => void;
}

export default function ImagesUploader({
  onChange,
  initialImages = [],
}: ImagesUploaderProps) {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [preservedImages, setPreservedImages] =
    useState<MediaFile[]>(initialImages);

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

    const merged = [...filesToUpload, ...compressedFiles];
    setFilesToUpload(merged);
  };

  const removeServerImage = (id: number) => {
    setPreservedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeNewImage = (index: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
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
          className="block w-full text-sm text-gray-500 h-14
            file:mr-4 file:mt-2 file:px-4 file:py-0 file:rounded-md file:border-0 file:cursor-pointer
            file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 
            hover:file:bg-blue-100"
        />
      </div>

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
    </div>
  );
}
