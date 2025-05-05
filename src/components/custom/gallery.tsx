import { GalleryGrid } from "./galleryGrid";
import { GalleryLightbox } from "./galleryLightbox";
import { MediaFile } from "@/lib/types";

export async function Gallery({ images }: { images: MediaFile[] }) {
  return (
    <>
      <GalleryGrid images={images} />
      <GalleryLightbox />
    </>
  );
}
