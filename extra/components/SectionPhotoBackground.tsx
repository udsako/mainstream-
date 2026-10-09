import Image from "next/image";

export default function SectionPhotoBackground({
  src,
  priority = false,
}: {
  src: string;
  priority?: boolean;
}) {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        className="scale-100 object-cover blur-sm brightness-[0.50] saturate-[0.85]"
      />
      {/* Wide, gradual fade to black at both top and bottom — the photo
          only sits at full visibility across the middle ~30% of the
          section. Long fade zones (not a short flash) are what make the
          handoff between sections read as smooth rather than a cut. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #0A0A0A 0%, transparent 38%, transparent 62%, #0A0A0A 100%)",
        }}
      />
    </div>
  );
}