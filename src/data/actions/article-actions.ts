"use server";
import qs from "qs";
import { FormInitState } from "./auth-actions";
import { mutateData } from "../services/mutate-data";
import { revalidatePath } from "next/cache";

export async function updateArticleAction(
  documentId: string,
  prevState: FormInitState,
  formData: FormData
) {
  const rawFormData = Object.fromEntries(formData);

  const query = qs.stringify({
    populate: "*",
  });

  const payload = {
    title: rawFormData.title,
    description: rawFormData.description,
    content: rawFormData.content,
    pointers: rawFormData.pointers,
  };

  console.log("PATLOOSA", payload);
  const responseData = await mutateData(
    "PUT",
    `/api/articles/${documentId}?${query}`,
    {
      data: payload,
    }
  );

  console.log("RES", responseData);

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
