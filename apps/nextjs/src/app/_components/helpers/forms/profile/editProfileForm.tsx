/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useS3Upload } from "next-s3-upload";

import { PleaseLogin } from "~/app/_components/helpers/simple/pleaseLogin";
import MapPicker, {
  DefaultLocation,
} from "~/app/_components/helpers/subComponents/map/mapPicker";
import { TagPicker } from "~/app/_components/helpers/subComponents/tag/tagPicker";
import { api } from "~/utils/api";

const maxFileSize = 1024 * 1024 * 5; // 5MB

export function EditProfileForm() {
  const { data: profileData } = api.profile.getSelf.useQuery();

  const [name, setName] = useState("");
  const [subHead, setSubHead] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState(DefaultLocation);
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>();
  const [resumeUrl, setResumeUrl] = useState<string | null>();

  const { openFileDialog, uploadToS3 } = useS3Upload();

  const uploadImage = async (file: File | undefined) => {
    if (!file || profileData) return;
    if (file.size > maxFileSize) {
      //TODO: no upload limit https://github.com/ryanto/next-s3-upload/issues/141
      alert("File too large");
      return;
    }
    const { url } = await uploadToS3(file);
    setImageUrl(url);
    await updateFiles({
      id: profileData!.id,
      imageUrl: imageUrl ?? undefined,
    });
  };
  const uploadResume = async (file: File | undefined) => {
    if (!file || profileData) return;
    if (file.size > maxFileSize) {
      //TODO: no upload limit https://github.com/ryanto/next-s3-upload/issues/141
      alert("File too large");
      return;
    }
    const { url } = await uploadToS3(file);
    setResumeUrl(url);
    await updateFiles({
      id: profileData!.id,
      resumeUrl: resumeUrl ?? undefined,
    });
  };

  const { data: userData } = api.auth.getSession.useQuery();

  useEffect(() => {
    if (profileData) {
      if (profileData.name) setName(profileData.name);
      if (profileData.body) setBody(profileData.body);
      if (profileData.subHead) setSubHead(profileData.subHead);
      if (profileData.locationLat && profileData.locationLon)
        setLocation({
          lat: profileData.locationLat,
          lng: profileData.locationLon,
        });
      if (profileData.profileImage) setImageUrl(profileData.profileImage);
      if (profileData.resumeFile) setResumeUrl(profileData.resumeFile);
      setTags(profileData.tags.map((t) => t.name));
    }
  }, [profileData]);

  const { mutateAsync: updateProfile, error } = api.profile.update.useMutation({
    onSuccess() {
      redirect("/profile/" + userData?.user.profileId);
    },
  });

  const { mutateAsync: updateFiles, error: fileError } =
    api.profile.fileUpdate.useMutation({
      onSuccess() {
        console.log("files updated");
      },
    });

  if (!userData?.user.id) {
    return <PleaseLogin />;
  }

  return (
    <form
      className="flex w-full max-w-2xl flex-col p-10"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          if (!userData) throw new Error("UNAUTHORIZED");
          await updateProfile({
            id: userData.user.profileId,
            name,
            subHead,
            body,
            locationLat: location.lat,
            locationLon: location.lng,
            tags,
            imageUrl: imageUrl ?? undefined,
            resumeUrl: resumeUrl ?? undefined,
          });
          redirect("/profile/" + userData?.user.profileId);
        } catch {
          // noop
        }
      }}
    >
      <label htmlFor="namelabel" className="mb-2 text-black">
        Name
      </label>
      <input
        className="mb-2 rounded border-2 border-blue-500 bg-white/10 p-2 text-black"
        value={name}
        id="namelabel"
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      {error?.data?.zodError?.fieldErrors.name && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.name}
        </span>
      )}

      <p>Upload Profile Image:</p>
      <input
        type="file"
        max={1}
        onChange={(e) => uploadImage(e.target.files![0] ?? undefined)}
        onClick={openFileDialog}
        className="rounded bg-blue-400 p-2 font-bold"
        title="Upload profile picture"
      />
      {imageUrl && <img src={imageUrl} alt="profile upload preview" />}
      {fileError?.data?.zodError?.fieldErrors.profileImage && (
        <span className="mb-2 text-red-500">
          {fileError.data.zodError.fieldErrors.profileImage}
        </span>
      )}

      {userData?.user.isEdu && (
        <>
          <p>Upload Resume:</p>
          <input
            type="file"
            max={1}
            onClick={openFileDialog}
            onChange={(e) => uploadResume(e.target.files![0] ?? undefined)}
            className="rounded bg-blue-400 p-2 font-bold"
            title="Upload resume"
          />
          {resumeUrl && <iframe src={resumeUrl} title="resumeDisplay" />}
          {fileError?.data?.zodError?.fieldErrors.resumeFile && (
            <span className="mb-2 text-red-500">
              {fileError.data.zodError.fieldErrors.resumeFile}
            </span>
          )}
        </>
      )}

      <label htmlFor="subheadlabel" className="mb-2 text-black">
        Sub-Heading
      </label>
      <input
        className="mb-2 rounded border-2 border-blue-500 bg-white/10 p-2 text-black"
        value={subHead}
        id="subheadlabel"
        onChange={(e) => setSubHead(e.target.value)}
        placeholder="Subheading"
      />
      {error?.data?.zodError?.fieldErrors.subHead && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.subHead}
        </span>
      )}
      <p className="mb-2 text-black">Location</p>
      <div className="h-80 w-80">
        <MapPicker location={location} setLocation={setLocation} />
      </div>
      {error?.data?.zodError?.fieldErrors.location && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.location}
        </span>
      )}
      <p className="mb-2 text-black">Tags</p>
      <TagPicker tags={tags} setTags={setTags} createTag={true} />
      {error?.data?.zodError?.fieldErrors.tags && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.tags}
        </span>
      )}
      <label htmlFor="bodylabel" className="mb-2 text-black">
        Content
      </label>
      <textarea
        className="mb-2 rounded border-2 border-blue-500 bg-white/10 p-2 text-black"
        value={body}
        rows={10}
        id="bodylabel"
        onChange={(e) => setBody(e.target.value)}
        placeholder="Content"
      />
      {error?.data?.zodError?.fieldErrors.body && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.body}
        </span>
      )}
      <button type="submit" className="rounded bg-blue-400 p-2 font-bold">
        Update
      </button>
      {error?.data?.code === "UNAUTHORIZED" && (
        <span className="mt-2 text-red-500">
          You must be logged in to edit your profile
        </span>
      )}
    </form>
  );
}
