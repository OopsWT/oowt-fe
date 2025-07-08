import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { getStrapiURL } from "@/lib/utils";
import Link from "next/link";

interface Image {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
}

interface Link {
  id: number;
  url: string;
  text: string;
}

export interface HeroSectionProps {
  id: number;
  documentId: string;
  __component: string;
  heading: string;
  subheading: string;
  image: Image;
  link: Link[];
}

export async function HeroSection({
  data,
}: {
  readonly data: HeroSectionProps;
}) {
  const user = await getUserMeLoader();
  const userLoggedIn = user?.ok;

  const { heading, subheading, image, link } = data;
  const imageURL = getStrapiURL() + image.url;
  const linkUrl = userLoggedIn ? "/dashboard" : link[0].url;

  return (
    <section className="mt-24 lg:mt-0 relative lg:h-[600px] overflow-hidden">
      <video
        loop
        autoPlay
        muted
        className="absolute z-10 object-center w-full inset-0"
        preload="auto"
      >
        <source src={imageURL || "wheel.mp4"} type="video/mp4" />
      </video>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white bg-amber-900/30 text-shadow text-shadow-gray-950">
        <h1 className="text-4xl font-bold md:text-5xl mt-4 lg:text-6xl bg-opacity-10">
          {heading}
        </h1>
        <p className="mt-4 text-lg md:text-xl lg:text-2xl bg-opacity-10">
          {subheading}
        </p>
        <Link
          className="mb-4 mt-8 inline-flex items-center justify-center px-6 py-3 text-base font-medium bg-white rounded-md shadow hover:bg-gray-100 bg-gradient-gold text-gray-900"
          href={linkUrl}
        >
          {userLoggedIn ? "Dashboard" : link[0].text}
        </Link>
      </div>
    </section>
  );
}
