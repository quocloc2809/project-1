import React from 'react'
import './SearchBar.css'

const SearchBar = ({ searchTerm, onSearchChange, onSearchSubmit, onClearSearch, placeholder = "Tìm kiếm..." }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearchSubmit()
        }
    }

    return (
        <div className="search-container">
            <div className="search-box">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={onSearchChange}
                    onKeyPress={handleKeyPress}
                    className="search-input"
                />
                <button
                    onClick={onSearchSubmit}
                    className="search-icon-btn"
                    title="Tìm kiếm (Enter)"
                >
                    🔍
                </button>
            </div>
            {searchTerm && (
                <button
                    onClick={onClearSearch}
                    className="clear-search-btn"
                    title="Xóa tìm kiếm"
                >
                    ✕
                </button>
            )}
        </div>
    )
}

export default SearchBar