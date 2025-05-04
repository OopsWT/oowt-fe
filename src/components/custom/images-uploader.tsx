"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import Image from "next/image";

interface ImagesUploaderProps {
  onChange: (files: File[]) => void;
  images: File[];
}

export default function ImagesUploader({
  onChange,
  images,
}: ImagesUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [serverImages, setServerImages] = useState<File[]>(images);

  useEffect(() => {
    const objectUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const merged = [...selectedFiles, ...files];
    setSelectedFiles(merged);
    onChange(merged);
  };

  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onChange(updatedFiles);
  };

  const removeUploadedImage = (id: number) => {
    const filtered = serverImages.filter((img) => img.id !== id);
    setServerImages(filtered);
  };

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm space-y-4">
      <div>
        <Label htmlFor="images" className="text-base font-semibold">
          Upload Images
        </Label>
        <Input
          id="images"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-amber-100 file:text-amber-700 file:cursor-pointer file:py-0
          hover:file:bg-blue-100"
        />
      </div>

      {/* Server images */}
      {serverImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {serverImages.map((img) => (
            <Card
              key={img.id}
              className="relative group overflow-hidden rounded-2xl h-30 pt-0"
            >
              <CardContent className="p-0">
                <Image
                  src={process.env.NEXT_PUBLIC_STRAPI_URL + img.url}
                  alt={img.name || `Image ${img.id}`}
                  className="w-full object-contain rounded-2xl !my-auto"
                  width={300}
                  height={300}
                />
              </CardContent>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeUploadedImage(img.id)}
                className="absolute top-2 right-2 bg-white/70 hover:bg-white text-red-600 hover:text-red-700 shadow transition-opacity opacity-0 group-hover:opacity-100"
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
              className="relative group overflow-hidden rounded-2xl h-30 pt-0"
            >
              <CardContent className="p-0">
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
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-white/70 hover:bg-white text-red-600 hover:text-red-700 shadow transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
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
