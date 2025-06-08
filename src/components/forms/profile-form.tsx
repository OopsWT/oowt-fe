"use client";
import React from "react";
import { cn } from "@/lib/utils";

import { SubmitButton } from "@/components/custom/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { updateProfileAction } from "@/data/actions/profile-actions";
import { StrapiErrors } from "@/components/custom/strapi-errors";
import { toast } from "sonner";

interface ProfileFormProps {
  id: string;
  username: string;
  email: string;
  credits: number;
  author: {
    id: number;
    documentId: string;
  };
}

interface AuthorFromProps {
  id: string;
  name: string;
  description: string;
}

function CountBox({ text }: { readonly text: number }) {
  const style = "font-bold text-md mx-1";
  const color = text > 0 ? "text-primary" : "text-red-500";
  return (
    <div
      className="flex items-center justify-center h-9 w-full rounded-md border border-input
      bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent
      file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none"
    >
      You have<span className={cn(style, color)}>{text}</span>credit(s)
    </div>
  );
}

const INITIAL_STATE = {
  data: null,
  strapiErrors: null,
  message: "",
  zodErrors: null,
  success: false,
};

export function ProfileForm({
  data,
  authorData,
  className,
}: {
  readonly data: ProfileFormProps;
  readonly authorData: AuthorFromProps;
  readonly className?: string;
}) {
  const updateProfileWithId = updateProfileAction.bind(
    null,
    data.author?.documentId
  );
  const [formState, formAction] = useActionState(
    updateProfileWithId,
    INITIAL_STATE
  );

  if (formState.success && formState.message) {
    toast(formState.message);
  }

  return (
    <form className={cn("space-y-4", className)} action={formAction}>
      <div className="space-y-4 flex flex-col md:grid">
        <div className="flex flex-col md:grid grid-cols-3 gap-4">
          <Input
            id="username"
            name="username"
            placeholder="Username"
            defaultValue={data?.username || ""}
            disabled
          />
          <Input
            id="email"
            name="email"
            placeholder="Email"
            defaultValue={data?.email || ""}
            disabled
          />
          <CountBox text={data?.credits} />
        </div>

        <div className="w-full md:w-auto md:grid grid-cols-2 gap-4">
          <Input
            id="name"
            name="name"
            placeholder="Author Name"
            defaultValue={authorData?.name || ""}
          />
        </div>
        <Textarea
          id="description"
          name="description"
          placeholder="Write your description here..."
          className="resize-none border rounded-md w-full h-[224px] p-2"
          defaultValue={authorData?.description || ""}
          required
        />
      </div>
      <div className="flex justify-end">
        <SubmitButton text="Update Profile" loadingText="Saving Profile" />
      </div>
      <StrapiErrors error={formState?.strapiErrors} />
    </form>
  );
}
