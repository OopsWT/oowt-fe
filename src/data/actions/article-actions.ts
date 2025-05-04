"use server";
import qs from "qs";
import { FormInitState } from "./auth-actions";
import { mutateData } from "../services/mutate-data";
import { revalidatePath } from "next/cache";
import { filesUploadService } from "../services/file-service";

export async function updateArticleAction(
  documentId: string,
  prevState: FormInitState,
  formData: FormData
) {
  const rawFormData = Object.fromEntries(formData);
  const images = rawFormData.images instanceof File ? [rawFormData.images] : [];
  const uploadedImages = await filesUploadService(images);

  const query = qs.stringify({
    populate: "*",
  });

  const payload = {
    title: rawFormData.title,
    description: rawFormData.description,
    content: rawFormData.content,
    pointers: rawFormData.pointers,
    blocks: JSON.stringify({
      __component: "shared.slider",
      images: uploadedImages.map((img: { id: number; url: string }) =>
        String(img.id)
      ),
    }),
  };

  const responseData = await mutateData(
    "PUT",
    `/api/articles/${documentId}?${query}`,
    {
      data: payload,
    }
  );

  if (!responseData) {
    return {
      ...prevState,
      strapiErrors: null,
      message: "Ops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      strapiErrors: responseData.error,
      message: "Failed to Update Profile.",
    };
  }

  revalidatePath(`/dashboard/articles/${rawFormData.slug}`);

  return {
    ...prevState,
    message: "Article Updated",
    data: responseData,
    strapiErrors: null,
  };
}

export async function createArticle(
  prevState: FormInitState,
  formData: FormData
) {
  function convertToSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }
  const generatedSlug = formData.get("title");
  formData.set("slug", convertToSlug(generatedSlug as string));

  const rawFormData = Object.fromEntries(formData);

  const query = qs.stringify({
    populate: "*",
  });

  const payload = {
    title: rawFormData.title,
    description: rawFormData.description,
    content: rawFormData.content,
    pointers: rawFormData.pointers,
    slug: rawFormData.slug,
  };

  const responseData = await mutateData("POST", `/api/articles?${query}`, {
    data: payload,
  });

  if (!responseData) {
    return {
      ...prevState,
      strapiErrors: null,
      message: "Ops! Something went wrong. Please try again.",
    };
  }

  if (responseData.error) {
    return {
      ...prevState,
      strapiErrors: responseData.error,
      message: "Failed to Create Article.",
    };
  }

  revalidatePath(`/dashboard/articles/${rawFormData.slug}`);

  return {
    ...prevState,
    message: "Article Created",
    data: responseData,
    strapiErrors: null,
  };
}
