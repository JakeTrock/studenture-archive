"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

import { PleaseLogin } from "~/app/_components/helpers/simple/pleaseLogin";
import MapPicker, {
  DefaultLocation,
} from "~/app/_components/helpers/subComponents/map/mapPicker";
import { PayTypeSelector } from "~/app/_components/helpers/subComponents/tag/payTypeSelector";
import { TagPicker } from "~/app/_components/helpers/subComponents/tag/tagPicker";
import { api } from "~/utils/api";

export function EditPostForm({ postId }: { postId: string }) {
  const { data: postData } = api.post.byId.useQuery(postId);
  const { data: userData } = api.auth.getSession.useQuery();

  const [title, setTitle] = useState("");
  const [subHead, setSubHead] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState(DefaultLocation);
  const [tags, setTags] = useState<string[]>([]);

  const { mutateAsync: updatePost, error } = api.post.update.useMutation({
    onSuccess() {
      redirect("/post/" + postId);
    },
  });

  useEffect(() => {
    if (postData) {
      setTitle(postData.title);
      setBody(postData.body);
      setSubHead(postData.subHead);
      setApplyLink(postData.applyLink);
      setLocation({
        lat: postData.locationLat,
        lng: postData.locationLon,
      });
      setTags(postData.tags.map((t) => t.name));
    }
  }, [postData]);

  if (!userData?.user.id) {
    return <PleaseLogin />;
  }

  return (
    <form
      className="flex w-full max-w-2xl flex-col p-10"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          if (!userData?.user.id) throw new Error("UNAUTHORIZED");
          await updatePost({
            id: postId,
            postCreator: userData.user.profileId,
            title,
            subHead,
            applyLink,
            body,
            locationLat: location.lat,
            locationLon: location.lng,
            tags,
          });
          setTitle("");
          setBody("");
          setSubHead("");
          setApplyLink("");
          setLocation(DefaultLocation);
          setTags([]);
        } catch {
          // noop
        }
      }}
    >
      <label htmlFor="titlelabel" className="mb-2 text-black">
        Title
      </label>
      <input
        className="mb-2 rounded border-2 border-blue-500 bg-white/10 p-2 text-black"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        id="titlelabel"
      />
      {error?.data?.zodError?.fieldErrors.title && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.title}
        </span>
      )}
      <label htmlFor="subheadinglabel" className="mb-2 text-black">
        Posting Description
      </label>
      <input
        className="mb-2 rounded border-2 border-blue-500 bg-white/10 p-2 text-black"
        value={subHead}
        onChange={(e) => setSubHead(e.target.value)}
        placeholder="Software engineer with typescript experience"
        id="subheadinglabel"
      />
      {error?.data?.zodError?.fieldErrors.subHead && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.subHead}
        </span>
      )}
      <label htmlFor="linklabel" className="mb-2 text-black">
        Application link/email
      </label>
      <input
        className="mb-2 rounded bg-white/10 p-2 text-black"
        value={applyLink}
        onChange={(e) => setApplyLink(e.target.value)}
        placeholder="application link or email"
        id="linklabel"
      />
      {error?.data?.zodError?.fieldErrors.applyLink && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.applyLink}
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

      <p className="mb-2 text-black">Job Type</p>
      <PayTypeSelector tags={tags} setTags={setTags} />

      <p className="mb-2 text-black">Tags list</p>
      <TagPicker tags={tags} setTags={setTags} createTag={true} />
      {error?.data?.zodError?.fieldErrors.tags && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.tags}
        </span>
      )}
      <label htmlFor="contentlabel" className="mb-2 text-black">
        Content
      </label>
      <textarea
        className="mb-2 rounded border-2 border-blue-500 bg-white/10 p-2 text-black"
        value={body}
        rows={10}
        onChange={(e) => setBody(e.target.value)}
        id="contentlabel"
        placeholder="Content"
      />
      {error?.data?.zodError?.fieldErrors.body && (
        <span className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.body}
        </span>
      )}
      {}
      <button type="submit" className="rounded bg-blue-400 p-2 font-bold">
        Update
      </button>
      {error?.data?.code === "UNAUTHORIZED" && (
        <span className="mt-2 text-red-500">
          You must be logged in to update a post
        </span>
      )}
    </form>
  );
}
