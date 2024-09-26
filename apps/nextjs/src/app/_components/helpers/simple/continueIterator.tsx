import React from "react";

const ContinueIterator = ({
  count,
  setCount,
}: {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <div className="flex items-center justify-center">
      <button
        className="rounded-full bg-gray-200 p-2"
        onClick={() => setCount((c) => c - 1)}
      >
        &lt;
      </button>
      <span className="mx-4 text-xl">{count}</span>
      <button
        className="rounded-full bg-gray-200 p-2"
        onClick={() => setCount((c) => c + 1)}
      >
        &gt;
      </button>
    </div>
  );
};

export default ContinueIterator;
