"use client";

import { tagColors } from "~/app/_components/helpers/subComponents/tag/tagColorizer";
import { api } from "~/utils/api";

export function PayTypeSelector({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: (tags: string[] | ((old: string[]) => string[])) => void;
}) {
  const tagSuggestions = api.tag.getPayTypes.useQuery(undefined, {
    // enabled: false,
  });

  return (
    <>
      <div className="flex h-20 flex-wrap gap-2 overflow-scroll rounded-md border-2 border-cyan-300 backdrop-blur-0">
        {tagSuggestions.data?.map((t, ind) => {
          const tagExistsLocally =
            tags?.find((tg) => tg === t.name) !== undefined;
          return (
            <button
              key={t.id + ind}
              className={
                "rounded px-2 py-1 " +
                (tagExistsLocally ? "bg-green-300" : tagColors[t.tagType])
              }
              onClick={() => {
                const tagSuggestionOverlap = tagSuggestions.data
                  ?.filter((t) => tags.find((tg) => tg === t.name))
                  .map((t) => t.name);
                // remove overlap and insert new
                setTags((tagOld) =>
                  tagOld
                    .filter((tg) => !tagSuggestionOverlap?.includes(tg))
                    .concat(t.name),
                );
              }}
            >
              {t.name}
            </button>
          );
        })}
      </div>
    </>
  );
}
