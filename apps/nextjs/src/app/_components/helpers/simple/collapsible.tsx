"use client";

import type { SVGProps } from "react";
import React, { useState } from "react";

const Collapsible = ({
  openText,
  closedText,
  defaultState,
  children,
}: {
  children: React.ReactNode;
  openText: string;
  closedText: string;
  defaultState?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultState);

  const toggleCollapsible = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        onClick={toggleCollapsible}
        className="flex items-center justify-between underline"
      >
        {isOpen ? (
          <>
            {openText} <ChevronDownIcon className="h-4 w-4" />
          </>
        ) : (
          <>
            {closedText} <ChevronLeftIcon className="h-4 w-4" />
          </>
        )}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
};

export default Collapsible;

function ChevronDownIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ChevronLeftIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
