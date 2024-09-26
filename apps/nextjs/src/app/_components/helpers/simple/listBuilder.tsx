import React, { useState } from "react";

interface ListBuilderProps {
  initialValue: string[];
  onChange: (value: string[]) => void;
}

const ListBuilder = (props: ListBuilderProps) => {
  const { initialValue, onChange } = props;
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddItem = () => {
    if (initialValue.includes(inputValue.trim()))
      return alert("Item already exists");
    if (inputValue.trim() !== "") {
      onChange([...initialValue, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveItem = (removeItem: string) => {
    const updatedList = initialValue.filter((item) => item !== removeItem);
    onChange(updatedList);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="New tag item"
        className="mb-2 rounded bg-white/10 p-2 text-black"
        value={inputValue}
        onChange={handleInputChange}
      />
      <button
        className="rounded bg-blue-400 p-2 font-bold"
        onClick={handleAddItem}
      >
        Add Item
      </button>
      <ul>
        {initialValue.map((item) => (
          <li className="flex justify-start text-black" key={item}>
            <p className="pr-8">{item}</p>
            <button
              className="rounded bg-blue-400 p-2 font-bold"
              onClick={() => handleRemoveItem(item)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListBuilder;
