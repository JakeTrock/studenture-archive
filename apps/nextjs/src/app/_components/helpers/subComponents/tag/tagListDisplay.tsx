"use client";

import React from "react";

import { tagColors } from "~/app/_components/helpers/subComponents/tag/tagColorizer";

export const SimpleListDisplay = ({
  elements,
}: {
  elements: {
    id: string;
    name: string;
    tagType: "userFlair" | "payType" | "location" | "timezone" | "userGen";
    highlighted?: boolean;
  }[];
}) => {
  return (
    <span className="flex justify-center">
      {elements.map((tag) => (
        <p
          key={tag.id}
          className={
            "hover: w-auto max-w-[10ch] truncate rounded px-2 py-1 hover:max-w-none " +
            tagColors[tag.tagType] +
            (tag.highlighted ? " shadow-sm shadow-lime-500" : "")
          }
        >
          {tag.name}
        </p>
      ))}
    </span>
  );
};
