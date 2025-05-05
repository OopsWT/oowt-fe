"use client";

import { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { GalleryImage } from "./galleryImage";

export function GalleryLightbox() {
  const [index, setIndex] = useState(-1);
  const [slides, setSlides] = useState<
    { src: string; alt?: string; width: number; height: number }[]
  >([]);

  useEffect(() => {
    const metaEl = document.getElementById("gallery-meta");
    if (!metaEl) return;

    const raw = metaEl.getAttribute("data-slides");
    if (!raw) return;

    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      setSlides(parsed);
    } catch (e) {
      console.error("Failed to parse gallery data", e);
    }

    const overlays = document.querySelectorAll("[data-gallery-index]");
    overlays.forEach((el) => {
      el.addEventListener("click", () => {
        const idx = Number(el.getAttribute("data-gallery-index"));
        setIndex(idx);
      });
    });

    return () => {
      overlays.forEach((el) => el.removeEventListener("click", () => {}));
    };
  }, []);

  return (
    <Lightbox
      open={index >= 0}
      close={() => setIndex(-1)}
      index={index}
      slides={slides}
      render={{ slide: GalleryImage }}
      counter={{ container: { style: { top: 12, left: 12 } } }}
      plugins={[Thumbnails, Counter]}
    />
  );
}
