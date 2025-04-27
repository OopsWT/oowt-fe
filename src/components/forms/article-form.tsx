"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

import { SubmitButton } from "@/components/custom/submit-button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { StrapiErrors } from "@/components/custom/strapi-errors";
import {
  createArticle,
  updateArticleAction,
} from "@/data/actions/article-actions";
import { ImageData } from "@/lib/types";
import { MDEditor } from "../custom/forwardRefEditor";
import { MapWrapper } from "../custom/mapWrapper";
import { MDXEditorMethods } from "@mdxeditor/editor";

interface ArticleFormProps {
  id: number;
  content: string;
  slug: string;
  title: string;
  description: string;
  createdAt: Date;
  publishedAt: Date;
  documentId: string;
  pointers: {
    pointers: number[][];
  };
  cover: ImageData;
}

const INITIAL_STATE = {
  data: null,
  strapiErrors: null,
  message: "",
  zodErrors: null,
};

function convertToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function ArticleForm({
  data,
  className,
}: {
  readonly data?: ArticleFormProps;
  readonly className?: string;
}) {
  const updateArticleWithId = updateArticleAction.bind(
    null,
    data?.documentId || ""
  );
  const [pointers, setPointers] = useState<number[][]>(
    data?.pointers.pointers || []
  );
  const [formState, formAction] = useActionState(
    data?.documentId ? updateArticleWithId : createArticle,
    INITIAL_STATE
  );

  const ref = React.useRef<MDXEditorMethods>(null);

  const formActionHandler = (formData: FormData) => {
    const generatedSlug = formData.get("title");

    formData.set("slug", convertToSlug(generatedSlug as string));
    formData.set("content", ref.current?.getMarkdown() || "");
    formData.set("pointers", JSON.stringify({ pointers }));
    return formAction(formData);
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
          defaultValue={data?.title}
        />
        <label className="font-bold">Article Description:</label>
        <Input
          id="description"
          name="description"
          placeholder="Description"
          defaultValue={data?.description}
        />

        <MapWrapper
          className="mb-4"
          onPointsChange={setPointers}
          pointers={pointers}
        />

        <label className="font-bold">Article Content:</label>

        <div className="space-y-4 w-full">
          <MDEditor markdown={data?.content || ""} ref={ref} />
        </div>
      </div>
      <div className="flex justify-end fixed bottom-25 right-40">
        <SubmitButton
          text={`${data ? "Update" : "Create"} Article`}
          loadingText="Saving changes..."
          className="shadow-amber-50 cursor-pointer"
        />
      </div>
      <StrapiErrors error={formState?.strapiErrors} />
    </form>
  );
}
