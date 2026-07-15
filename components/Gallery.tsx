"use client";

import { useState } from "react";

// Add your images to /public/gallery/ using these exact filenames
// (or change the filenames here to match whatever you upload).
const GALLERY_IMAGES = [
  "/gallery/1.jpg",
  "/gallery/2.jpg",
  "/gallery/3.jpg",
  "/gallery/4.jpg",
  "/gallery/5.jpg",
  "/gallery/6.jpg",
];

function GalleryTile({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-court-line bg-court-panel">
        <span className="px-4 text-center font-mono text-[10px] uppercase tracking-widest text-white/25">
          {src.split("/").pop()}
        </span>
      </div>
    );
  }

  return (
    // Plain <img> instead of next/image since these files may not exist yet —
    // avoids build-time errors and lets onError swap in the placeholder.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Mainstream Basketball Club"
      onError={() => setFailed(true)}
      className="aspect-square w-full rounded-md border border-court-line object-cover"
    />
  );
}

export default function Gallery() {
  return (
    <section id="gallery" className="mx-auto max-w-6xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">
        Moments
      </p>
      <h2 className="mb-4 font-display text-4xl text-white sm:text-5xl">
        From the court
      </h2>
      <p className="mb-10 max-w-md text-sm text-white/50">
        Drop images into <code className="text-mainstream-orange">/public/gallery/</code> named{" "}
        <code className="text-mainstream-orange">1.jpg</code> through{" "}
        <code className="text-mainstream-orange">6.jpg</code> and they&apos;ll show up here
        automatically. Empty boxes just show a placeholder until then.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {GALLERY_IMAGES.map((src) => (
          <GalleryTile key={src} src={src} />
        ))}
      </div>
    </section>
  );
}
