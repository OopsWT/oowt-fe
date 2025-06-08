import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { getAuthorLoader } from "@/data/services/get-author-loader";
import { ProfileForm } from "@/components/forms/profile-form";
import { ProfileImageForm } from "@/components/forms/profile-image-form";

export default async function AccountRoute() {
  const user = await getUserMeLoader();
  const userData = user.data;

  // Get author data using the author ID from user data
  let authorData = null;
  if (userData?.author?.id) {
    const author = await getAuthorLoader(userData.author.documentId);
    if (author.ok && author.data) {
      authorData = author.data;
    }
  }

  return (
    <div className="flex flex-col md:grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 min-h-screen">
      <ProfileForm
        data={userData}
        authorData={authorData}
        className="col-span-3"
      />
      <ProfileImageForm data={authorData} className="col-span-2" />
    </div>
  );
}
