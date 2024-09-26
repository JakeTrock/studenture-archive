"use client";

import { useState } from "react";

import { tagColors } from "~/app/_components/helpers/subComponents/tag/tagColorizer";
import { api } from "~/utils/api";

export function TagPicker({
  tags,
  setTags,
  createTag = false,
}: {
  tags: string[];
  setTags: (tags: string[]) => void;
  createTag?: boolean;
}) {
  const [currentTag, setCurrentTag] = useState<string>("");
  const tagExistsInDb = api.tag.confirmExists.useQuery(currentTag, {
    enabled: currentTag !== "",
    placeholderData: false,
  });
  const tagSuggestions = api.tag.naturalSearch.useQuery(currentTag, {
    enabled: currentTag.length > 2,
    placeholderData: [],
  });

  return (
    <>
      <div className="flex h-20 flex-wrap gap-2 overflow-scroll rounded-md border-2 border-cyan-300 backdrop-blur-0">
        {tags.map((t) => (
          <button
            key={t}
            className="rounded bg-gray-200 px-2 py-1"
            onClick={() => {
              setTags(tags.filter((tag) => tag !== t));
            }}
          >
            {t} &times;
          </button>
        ))}
      </div>

      <div className="flex h-10 flex-wrap gap-2 backdrop-blur-0">
        <input
          className="bg-transparent text-black"
          type="text"
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          name="tags"
          placeholder={createTag ? "Create or add tags" : "Add tag"}
        />

        {createTag && tagExistsInDb.data === false && (
          <button
            className="rounded bg-gray-200 px-2 py-1"
            onClick={() => {
              if (currentTag.length < 3) {
                alert("Tag name too short");
                return;
              }
              if (currentTag.length > 256) {
                alert("Tag name too long");
                return;
              }
              const tagExistsLocally =
                tags?.find((tg) => tg === currentTag) !== undefined;
              if (!tagExistsLocally) {
                setTags([...tags, currentTag]);
                setCurrentTag("");
              } else {
                alert("Tag already exists");
              }
            }}
          >
            create new tag
          </button>
        )}
      </div>

      <div className="flex h-20 flex-wrap gap-2 overflow-scroll rounded-md border-2 border-cyan-300 backdrop-blur-0">
        {tagSuggestions.data!.map((t) => (
          <button
            key={t.id}
            className={"rounded px-2 py-1 " + tagColors[t.tagType]}
            onClick={() => {
              if (currentTag.length < 3) {
                alert("Tag name too short");
                return;
              }
              if (t.name.length > 256) {
                alert("Tag name too long");
                return;
              }
              const tagExistsLocally =
                tags?.find((tg) => tg === t.name) !== undefined;
              if (!tagExistsLocally) {
                setTags([...tags, t.name]);
                setCurrentTag("");
              } else {
                alert("Tag already exists");
              }
            }}
          >
            {t.name}
          </button>
        ))}
      </div>
    </>
  );
}
