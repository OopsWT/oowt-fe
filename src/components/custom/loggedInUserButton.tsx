import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/data/actions/auth-actions";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";

interface AuthUserProps {
  username: string;
  email: string;
  image: {
    url: string;
    alternativeText: string;
  };
}

export function LoggedInUserButton({
  userData,
}: {
  readonly userData: AuthUserProps;
}) {
  const avatar = getStrapiMedia(userData.image.url);
  return (
    <div className="flex gap-2">
      <div className="flex gap-2 items-center mr-3">
        {avatar && (
          <Image
            width={30}
            height={30}
            src={avatar}
            alt={userData.image.alternativeText || ""}
            className="rounded-full border"
          />
        )}
        <Link
          href="/dashboard/account"
          className="font-semibold hover:text-primary"
        >
          {userData.username}
        </Link>
      </div>
      <Tooltip>
        <TooltipTrigger onClick={logoutAction}>
          <LogOut className="w-6 h-6 hover:text-primary cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Logout</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
