"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

import { SubmitButton } from "@/components/custom/submit-button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { StrapiErrors } from "@/components/custom/strapi-errors";
import { updateArticleAction } from "@/data/actions/article-actions";
import { ImageData } from "@/lib/types";
import { MDEditor } from "../custom/forwardRefEditor";

interface ArticleFormProps {
  id: number;
  content: string;
  slug: string;
  title: string;
  description: string;
  createdAt: Date;
  publishedAt: Date;
  documentId: string;
  // pointers: string;
  cover: ImageData;
}

const INITIAL_STATE = {
  data: null,
  strapiErrors: null,
  message: "",
  zodErrors: null,
};

export function ArticleForm({
  data,
  className,
}: {
  readonly data: ArticleFormProps;
  readonly className?: string;
}) {
  const updateArticleWithId = updateArticleAction.bind(null, data.documentId);
  const [contentValue, setContentValue] = useState<string>();
  const [formState, formAction] = useActionState(
    updateArticleWithId,
    INITIAL_STATE
  );

  const formActionHandler = (formData: FormData) => {
    formData.set("content", contentValue || "");
    return formAction(formData);
  };

  const updateContentValue = (value: string) => {
    setContentValue(value);
  };

  return (
    <form
      className={cn("space-y-4 prose", className)}
      action={formActionHandler}
    >
      <div className="space-y-4 grid ">
        <label className="font-bold">Article Title:</label>
        <Input
          id="title"
          name="title"
          placeholder="Article title"
          defaultValue={data?.title || ""}
        />
        <label className="font-bold">Article Description:</label>
        <Input
          id="description"
          name="description"
          placeholder="Description"
          defaultValue={data?.description || ""}
        />
        <label className="font-bold">Article Content:</label>
        <div className="prose">
          <MDEditor
            markdown={data?.content || ""}
            onChange={updateContentValue}
          />
        </div>

        {/* <Input
          id="content"
          name="content"
          placeholder="Content"
          defaultValue={data?.content || ""}
        /> */}
      </div>
      <div className="flex justify-end">
        <SubmitButton text="Update Article" loadingText="Saving Profile" />
      </div>
      <StrapiErrors error={formState?.strapiErrors} />
    </form>
  );
}
