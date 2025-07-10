"use server";
import qs from "qs";
import { FormInitState } from "./auth-actions";
import { mutateData } from "../services/mutate-data";
import { revalidatePath } from "next/cache";
import { filesUploadService } from "../services/file-service";
import { getAuthToken } from "../services/get-token";
import { z } from "zod";
import { redirect } from "next/navigation";

export async function updateArticleAction(
  documentId: string,
  prevState: FormInitState,
  formData: FormData
) {
  const rawFormData = Object.fromEntries(formData);
  let uploadedImages: { id: number; url: string; documentId: string }[] = [];

  if (formData.getAll("newImages").length > 0) {
    uploadedImages =
      (await filesUploadService(formData.getAll("newImages") as File[])) || [];
  }

  const allImages = [
    ...uploadedImages?.map((img: { id: number; url: string }) => img.id),
    ...JSON.parse((rawFormData.images || "[]") as string)?.map(
      (img: { id: number; url: string }) => img.id
    ),
  ];

  const query = qs.stringify({
    populate: "*",
  });

  const payload = {
    title: rawFormData.title,
    description: rawFormData.description,
    content: rawFormData.content,
    pointers: rawFormData.pointers,
    distance: rawFormData.distance,
    blocks: [
      {
        __component: "shared.slider",
        files: allImages,
      },
    ],
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

const schemaRegister = z.object({
  title: z.string().min(3, {
    message: "Title must be min. 3 characters",
  }),
  description: z.string().min(6).max(500, {
    message: "Description must be between 6 and 500 characters",
  }),
  // newImages: z.z.array(z.any()).nonempty({
  //   message: "Select min 1 image",
  // }),
});

export async function createArticle(
  prevState: FormInitState,
  formData: FormData
) {
  const authToken = await getAuthToken();
  function convertToSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }
  const generatedSlug = formData.get("title");
  formData.set("slug", convertToSlug(generatedSlug as string));

  const validatedFields = schemaRegister.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    // newImages: formData.get("newImages"),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: null,
      message: "Missing Fields. Failed to Register.",
    };
  }

  const rawFormData = Object.fromEntries(formData);
  const uploadedImages = await filesUploadService(
    formData.getAll("newImages") as File[]
  );

  const query = qs.stringify({
    populate: "*",
  });

  const images = uploadedImages?.map((img) => img.id);

  const payload = {
    title: rawFormData.title,
    description: rawFormData.description,
    content: rawFormData.content,
    pointers: rawFormData.pointers,
    slug: rawFormData.slug,
    distance: rawFormData.distance,
    blocks: [
      {
        __component: "shared.slider",
        files: images,
      },
    ],
    cover: uploadedImages?.[0]?.id,
  };

  const responseData = await mutateData("POST", `/api/articles?${query}`, {
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
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
  redirect("/dashboard");
  return {
    ...prevState,
    message: "Article Created",
    data: responseData,
    strapiErrors: null,
  };
}
