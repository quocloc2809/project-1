import React from 'react';
import './Pagination.css';

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    onPageChange,
    searchTerm = '',
    originalTotal = null
}) => {
    const maxVisiblePages = 5;

    // Don't render if only 1 page
    if (totalPages <= 1) return null;

    const pages = [];

    // Previous button
    pages.push(
        <button
            key="prev"
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
        >
            ‹
        </button>
    );

    // Page numbers logic
    if (totalPages <= maxVisiblePages) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                    onClick={() => onPageChange(i)}
                >
                    {i}
                </button>
            );
        }
    } else {
        // Always show page 1
        pages.push(
            <button
                key={1}
                className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`}
                onClick={() => onPageChange(1)}
            >
                1
            </button>
        );

        // Calculate range of pages to show around current page
        let startPage, endPage;

        if (currentPage < 3) {
            // Pages 1-2: show 2, 3, 4
            startPage = 2;
            endPage = Math.min(4, totalPages - 1);
        } else if (currentPage >= totalPages - 2) {
            // Near end: show last few pages
            startPage = Math.max(2, totalPages - 3);
            endPage = totalPages - 1;
        } else {
            // Middle pages: show current - 1, current, current + 1
            startPage = currentPage - 1;
            endPage = Math.min(totalPages - 1, currentPage + 1);
        }

        // Show dots before middle pages if needed
        if (startPage > 2) {
            pages.push(<span key="dots1" className="pagination-dots">...</span>);
        }

        // Display the middle pages
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                    onClick={() => onPageChange(i)}
                >
                    {i}
                </button>
            );
        }

        // Show dots if current page is before last 2 pages
        if (currentPage < totalPages - 2) {
            pages.push(<span key="dots2" className="pagination-dots">...</span>);
        }

        // Always show last page
        pages.push(
            <button
                key={totalPages}
                className={`pagination-btn ${currentPage === totalPages ? 'active' : ''}`}
                onClick={() => onPageChange(totalPages)}
            >
                {totalPages}
            </button>
        );
    }

    // Next button
    pages.push(
        <button
            key="next"
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
        >
            ›
        </button>
    );

    return (
        <div className="pagination">
            <div className="pagination-info">
                {totalItems > 0 ? (
                    <>
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} của {totalItems} kết quả
                        {searchTerm && originalTotal && ` (lọc từ ${originalTotal} tổng cộng)`}
                    </>
                ) : (
                    searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : 'Không có dữ liệu'
                )}
            </div>
            <div className="pagination-controls">
                {pages}
            </div>
        </div>
    );
};

export default Pagination;
