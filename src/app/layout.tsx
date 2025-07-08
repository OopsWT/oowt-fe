import type { Metadata } from "next";
import { Barlow_Condensed, PT_Sans, PT_Serif } from "next/font/google";
import { getGlobalData } from "@/data/loaders";
import { Header } from "@/components/custom/header";
import { Footer } from "@/components/custom/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  weight: "400",
  subsets: ["latin"],
});

export const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  weight: "400",
  subsets: ["latin"],
});

export const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oops... Wrong Turn!",
  description: "Blog o zakrętach, które warto było wziąć.",
  openGraph: {
    type: "website",
    url: "https://oopswrongturn.pl",
    title: "Oops... Wrong Turn!",
    description: "Blog o zakrętach, które warto było wziąć.",
    siteName: "Oops Wrong Turn",
    images: [{ url: "https://oopswrongturn.pl/images/defaultImage.png" }],
  },
  twitter: {
    title: "Oops... Wrong Turn!",
    description: "Blog o zakrętach, które warto było wziąć.",
    images: [{ url: "https://oopswrongturn.pl/images/defaultImage.png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalData = await getGlobalData();
  return (
    <html lang="en">
      <body
        className={`${ptSans.variable} ${ptSerif.variable} ${barlowCondensed.variable} antialiased`}
      >
        <Toaster position="bottom-center" />
        <Header data={globalData?.header} />
        {children}
        <Footer data={globalData?.footer} />
      </body>
    </html>
  );
}
