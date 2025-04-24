import Link from "next/link";
import { Logo } from "@/components/custom/logo";
import { Button } from "@/components/ui/button";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { LoggedInUserButton } from "./loggedInUserButton";

export interface HeaderProps {
  logoText: {
    id: number;
    text: string;
    url: string;
  };
  ctaButton: {
    id: number;
    text: string;
    url: string;
  };
}

export async function Header({ data }: { data: Readonly<HeaderProps> }) {
  const user = await getUserMeLoader();
  const { logoText, ctaButton } = data;

  if (!data) return <div>No Header Data</div>;

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow-md dark:bg-gray-800">
      <Logo text={logoText.text} />
      <div className="flex items-center gap-4">
        {user.ok ? (
          <LoggedInUserButton userData={user.data} />
        ) : (
          <Link href={ctaButton.url}>
            <Button>{ctaButton.text}</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
