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
import { MediaFile, Article } from "@/lib/types";
import { MDEditor } from "../custom/forwardRefEditor";
import { MapWrapper } from "../custom/mapWrapper";
import { MDXEditorMethods } from "@mdxeditor/editor";
import ImagesUploader from "../custom/images-uploader";
import { ZodErrors } from "../custom/zod-errors";

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
  readonly data?: Article;
  readonly className?: string;
}) {
  const updateArticleWithId = updateArticleAction.bind(
    null,
    data?.documentId || ""
  );
  const [pointers, setPointers] = useState<number[][]>(
    data?.pointers?.pointers || []
  );
  const [formState, formAction] = useActionState(
    data?.documentId ? updateArticleWithId : createArticle,
    INITIAL_STATE
  );
  const [images, setImages] = useState<MediaFile[]>(
    data?.blocks?.[0]?.files || []
  );
  const [newImages, setNewImages] = useState<File[]>([]);

  const ref = React.useRef<MDXEditorMethods>(null);

  const formActionHandler = async (formData: FormData) => {
    formData.set("content", ref.current?.getMarkdown() || "");
    formData.set("pointers", JSON.stringify({ pointers }));
    if (newImages.length > 0) {
      newImages.forEach((file) => {
        formData.append("newImages", file);
      });
    }
    if (images.length > 0) {
      formData.set("images", JSON.stringify(images));
    }

    return formAction(formData);
  };

  const handleChangeImages = (files: File[], preserved: MediaFile[]) => {
    setNewImages(files);
    setImages(preserved);
  };

  return (
    <form
      className={cn("space-y-4 prose", className)}
      action={formActionHandler}
    >
      <div className="space-y-4 md:grid ">
        <label className="font-bold" htmlFor="title">
          Article Title:
        </label>
        <Input
          id="title"
          name="title"
          placeholder="Article title"
          defaultValue={data?.title}
        />
        <ZodErrors error={formState?.zodErrors?.title} />

        <label className="font-bold" htmlFor="description">
          Article Description:
        </label>
        <Input
          id="description"
          name="description"
          placeholder="Description"
          defaultValue={data?.description}
        />
        <ZodErrors error={formState?.zodErrors?.description} />

        <MapWrapper
          className="mb-4"
          onPointsChange={setPointers}
          pointers={pointers}
        />

        <label className="font-bold" htmlFor="images">
          Images Gallery
        </label>
        <ImagesUploader onChange={handleChangeImages} initialImages={images} />
        {/* <ZodErrors error={formState?.zodErrors?.newImages} /> */}

        <label className="font-bold">Article Content:</label>

        <div className="space-y-4 w-full border-1 rounded-lg !min-h-90">
          <MDEditor markdown={data?.content || ""} ref={ref} />
        </div>
      </div>
      <div className="flex justify-end fixed bottom-20 md:bottom-25 right-10 md:right-40 z-50">
        <SubmitButton
          text={`${data ? "Update" : "Create"} Article`}
          loadingText="Saving changes..."
          className="shadow-amber-50 cursor-pointer bg-gradient-gold text-gray-900"
        />
      </div>
      <StrapiErrors error={formState?.strapiErrors} />
    </form>
  );
}
