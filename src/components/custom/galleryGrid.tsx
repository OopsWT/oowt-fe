import { MediaFile } from "@/lib/types";
import { Gallery } from "next-gallery";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export function GalleryGrid({ images }: { images: MediaFile[] }) {
  const galleryItems = images.map((img) => ({
    src: process.env.NEXT_PUBLIC_STRAPI_URL + img.url,
    width: img.width,
    height: img.height,
    alt: img.alternativeText || img.name,
    aspect_ratio: img.width / img.height,
  }));

  const widths = [1000, 1000, 1600];
  const ratios = [2.2, 4, 6, 8];

  return (
    <div className="my-8">
      <Gallery
        images={galleryItems}
        widths={widths}
        ratios={ratios}
        gap="2px"
        lastRowBehavior="fill"
        overlay={(index) => (
          <div
            data-gallery-index={index}
            className="absolute inset-0 cursor-pointer bg-black/20 hover:bg-amber-500/30 transition-all"
          />
        )}
      />
      <div
        id="gallery-meta"
        data-slides={encodeURIComponent(JSON.stringify(galleryItems))}
        hidden
      />
    </div>
  );
}
