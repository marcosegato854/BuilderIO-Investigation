import React, { useState } from "react";
import "./SearchBar.css";

const SearchBar = ({
  placeholder = "What are you looking for?",
  onSearch,
  className = "",
}) => {
  const [value, setValue] = useState("");

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <form className={`search-bar ${className}`} onSubmit={handleSubmit}>
      <div className="search-bar__container">
        <input
          type="text"
          className="search-bar__input"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <button
          type="submit"
          className="search-bar__button"
          aria-label="Search"
        >
          <svg
            className="search-bar__icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M10.2635 20.5271C12.5407 20.5266 14.7523 19.7643 16.5461 18.3615L22.1859 24.0013L24 22.1872L18.3602 16.5474C19.7637 14.7534 20.5265 12.5413 20.5271 10.2635C20.5271 4.60448 15.9226 0 10.2635 0C4.60448 0 0 4.60448 0 10.2635C0 15.9226 4.60448 20.5271 10.2635 20.5271ZM10.2635 2.56588C14.5088 2.56588 17.9612 6.01828 17.9612 10.2635C17.9612 14.5088 14.5088 17.9612 10.2635 17.9612C6.01828 17.9612 2.56588 14.5088 2.56588 10.2635C2.56588 6.01828 6.01828 2.56588 10.2635 2.56588Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      <div className="search-bar__underline"></div>
    </form>
  );
};

export default SearchBar;
