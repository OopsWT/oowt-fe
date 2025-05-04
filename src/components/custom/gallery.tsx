import { GalleryGrid } from "./galleryGrid";
import { GalleryLightbox } from "./galleryLightbox";
import { File } from "@/lib/types";

export async function Gallery({ images }: { images: File[] }) {
  return (
    <>
      <GalleryGrid images={images} />
      <GalleryLightbox />
    </>
  );
}
