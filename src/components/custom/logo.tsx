import Link from "next/link";
import { OWTLogo } from "../vectors/logo";

interface LogoProps {
  text?: string;
  dark?: boolean;
}

export function Logo({}: Readonly<LogoProps>) {
  return (
    <Link className="flex items-center gap-2" href="/">
      <OWTLogo />
    </Link>
  );
}
