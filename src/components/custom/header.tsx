import Link from "next/link";
import { Logo } from "@/components/custom/logo";
import { Button } from "@/components/ui/button";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { LoggedInUserButton } from "./loggedInUserButton";
import { getAuthorLoader } from "@/data/services/get-author-loader";

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

  let authorData = null;
  if (user?.data.author?.id) {
    const author = await getAuthorLoader(user.data.author.documentId);
    if (author.ok && author.data) {
      authorData = author.data;
    }
  }
  const { logoText, ctaButton } = data;

  if (!data) return <div>No Header Data</div>;

  return (
    <header className="flex items-center justify-between px-4 bg-white/70 shadow-md dark:bg-gray-800 fixed z-30 w-full top-0 backdrop-blur-md">
      <Logo text={logoText.text} />
      <div className="flex items-center gap-4">
        {user.ok ? (
          <LoggedInUserButton userData={{ ...user.data, ...authorData }} />
        ) : (
          <Link href={ctaButton.url}>
            <Button>{ctaButton.text}</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
