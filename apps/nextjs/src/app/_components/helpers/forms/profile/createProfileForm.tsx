/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useS3Upload } from "next-s3-upload";

import MapPicker, {
  DefaultLocation,
} from "~/app/_components/helpers/subComponents/map/mapPicker";
import { TagPicker } from "~/app/_components/helpers/subComponents/tag/tagPicker";
import { api } from "~/utils/api";

const maxFileSize = 1024 * 1024 * 5; // 5MB

export function CreateProfileForm() {
  const [title, setTitle] = useState("");
  const [subHead, setSubHead] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState(DefaultLocation);
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>();
  const [resumeUrl, setResumeUrl] = useState<string | null>();

  const { openFileDialog, uploadToS3 } = useS3Upload();

  const uploadImage = async (file: File | undefined) => {
    if (!file) return; //TODO: no file garbage collection
    if (file.size > maxFileSize) {
      alert("File too large");
      return;
    }
    const { url } = await uploadToS3(file);
    setImageUrl(url);
  };
  const uploadResume = async (file: File | undefined) => {
    if (!file) return; //TODO: no file garbage collection
    if (file.size > maxFileSize) {
      //TODO: no upload limit https://github.com/ryanto/next-s3-upload/issues/141
      alert("File too large");
      return;
    }
    const { url } = await uploadToS3(file);
    setResumeUrl(url);
  };

  const { data: userData } = api.auth.getSession.useQuery();

  const { mutateAsync: createProfile, error } = api.profile.create.useMutation({
    onSuccess() {
      setTitle("");
      setBody("");
      setSubHead("");
      setLocation(DefaultLocation);
      setTags([]);
    },
  });

  return (
    <form
      className="flex w-full max-w-2xl flex-col"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          if (!userData) throw new Error("UNAUTHORIZED");
          await createProfile({
            profileOwner: userData.user.id,
            subHead,
            body,
            locationLat: location.lat,
            locationLon: location.lng,
            tags,
            imageUrl: imageUrl ?? undefined,
            resumeUrl: resumeUrl ?? undefined,
          });
          setTitle("");
          setBody("");
          setSubHead("");
          setLocation(DefaultLocation);
          setTags([]);
        } catch {
          // noop
        }
      }}
    >
      <input
        className="mb-2 rounded bg-white/10 p-2 text-black"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      {error?.data?.zodError?.fieldErrors.title && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.title}
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
      {error?.data?.zodError?.fieldErrors.profileImage && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.profileImage}
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
          {error?.data?.zodError?.fieldErrors.resumeFile && (
            <span className="mb-2 text-red-500">
              {error.data.zodError.fieldErrors.resumeFile}
            </span>
          )}
        </>
      )}

      <input
        className="mb-2 rounded bg-white/10 p-2 text-black"
        value={subHead}
        onChange={(e) => setSubHead(e.target.value)}
        placeholder="Subheading"
      />
      {error?.data?.zodError?.fieldErrors.subHead && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.subHead}
        </span>
      )}

      <MapPicker location={location} setLocation={setLocation} />
      {error?.data?.zodError?.fieldErrors.location && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.location}
        </span>
      )}

      <TagPicker tags={tags} setTags={setTags} createTag={true} />
      {error?.data?.zodError?.fieldErrors.tags && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.tags}
        </span>
      )}

      <input
        className="mb-2 rounded bg-white/10 p-2 text-black"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Content"
      />
      {error?.data?.zodError?.fieldErrors.body && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.body}
        </span>
      )}

      <button type="submit" className="rounded bg-blue-400 p-2 font-bold">
        Create
      </button>
      {error?.data?.code === "UNAUTHORIZED" && (
        <span className="mt-2 text-red-500">
          You must be logged in to make a profile
        </span>
      )}
    </form>
  );
}
