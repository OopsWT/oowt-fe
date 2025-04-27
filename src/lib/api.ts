import axios, { AxiosInstance } from "axios";
import { getStrapiURL } from "./utils";
import qs from "qs";

export const api: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_STRAPI_URL}`,
});

// Get post by slug
export const getArticleBySlug = async <Article>(
  slug: string
): Promise<Article> => {
  const url = new URL("/api/articles", getStrapiURL());

  url.search = qs.stringify({
    filters: {
      slug,
    },
    populate: ["author.avatar", "categories"],
  });

  try {
    const response = await api.get(url.href); // Fetch a single blog post using the slug parameter
    if (response.data.data.length > 0) {
      // If post exists
      return response.data.data[0]; // Return the post data
    }
    throw new Error("Post not found.");
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new Error("Server error");
  }
};

// Get all posts categories
export const getAllCategories = async () => {
  try {
    const response = await api.get("api/categories"); // Route to fetch Categories data
    return response.data.data; // Return all categories
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new Error("Server error");
  }
};

// Upload image with correct structure for referencing in the blog
export const uploadImage = async (image: File, refId: number) => {
  try {
    const formData = new FormData();
    formData.append("files", image);
    formData.append("ref", "api::blog.blog"); // ref: Strapi content-type name (in this case 'blog')
    formData.append("refId", refId.toString()); // refId: Blog post ID
    formData.append("field", "cover"); // field: Image field name in the blog

    const response = await api.post("api/upload", formData); // Strapi route to upload files and images
    const uploadedImage = response.data[0];
    return uploadedImage; // Return full image metadata
  } catch (err) {
    console.error("Error uploading image:", err);
    throw err;
  }
};
