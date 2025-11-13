import React, { useState, useEffect } from 'react'
import './DocumentsList.css'

const OutgoingDocumentCombobox = ({ onChange, value = '', placeholder = "Tìm kiếm văn bản đi..." }) => {
    const [searchTerm, setSearchTerm] = useState(value || '');
    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // keep internal input in sync when parent provides a new value
    useEffect(() => {
        setSearchTerm(value || '');
    }, [value]);

    const fetchOutgoingDocuments = async (query = '') => {
        try {
            setLoading(true);
            console.log('Fetching outgoing documents with query:', query);
            const response = await fetch(`http://localhost:3001/api/outgoing-documents/search?q=${encodeURIComponent(query)}`);
            console.log('Response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                if (data.success) {
                    setOptions(data.data);
                    console.log('Options set:', data.data.length, 'items');
                }
            }
        } catch (error) {
            console.error('Error fetching outgoing documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        if (newValue.length >= 2 || newValue === '') {
            fetchOutgoingDocuments(newValue);
        }
    };

    const handleOptionSelect = (option) => {
        setSearchTerm(option.DocumentNo);
        onChange(option.DocumentNo);
        setIsOpen(false);
    };

    const handleFocus = () => {
        setIsOpen(true);
        if (options.length === 0) {
            fetchOutgoingDocuments();
        }
    };

    return (
        <div className="outgoing-combobox">
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                placeholder={placeholder}
                className="form-input outgoing-input"
            />
            <button
                type="button"
                className="combobox-clear"
                title="Xóa"
                onMouseDown={(e) => e.preventDefault()} /* prevent blur */
                onClick={() => {
                    if (!searchTerm) return;
                    setSearchTerm('');
                    onChange('');
                    setIsOpen(false);
                }}
                disabled={!searchTerm}
            >
                ✖
            </button>
            {isOpen && (
                <div className="combobox-dropdown">
                    {loading ? (
                        <div className="combobox-loading">Đang tải...</div>
                    ) : options.length > 0 ? (
                        options.map(option => (
                            <div
                                key={option.DocumentID}
                                className="combobox-option"
                                onClick={() => handleOptionSelect(option)}
                            >
                                {option.DocumentNo}
                            </div>
                        ))
                    ) : (
                        <div className="combobox-no-data">Không tìm thấy dữ liệu</div>
                    )}
                </div>
            )}
        </div>
    );
};

const EditModal = ({
    showEditModal,
    editingDocument,
    onClose,
    onSave,
    onReviewNoteChange,
    onOutgoingDocumentChange
}) => {
    if (!showEditModal || !editingDocument) return null;

    // status is derived from whether there's an outgoing document and is not editable

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Chỉnh sửa văn bản</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Số hiệu:</label>
                        <input
                            type="text"
                            value={editingDocument.DocumentNo || ''}
                            disabled
                            className="form-input disabled"
                        />
                    </div>
                    <div className="form-group">
                        <label>Trích yếu:</label>
                        <input
                            type="text"
                            value={editingDocument.DocumentSummary || ''}
                            disabled
                            className="form-input disabled"
                        />
                    </div>
                    <div className="form-group">
                        <label>Văn bản trả lời:</label>
                        <OutgoingDocumentCombobox
                            value={editingDocument.selectedOutgoingDocument || editingDocument.OutgoingDocs || editingDocument.OutGoingDocs || ''}
                            onChange={onOutgoingDocumentChange}
                            placeholder="Tìm kiếm văn bản đi..."
                        />
                    </div>
                    <div className="form-group">
                        <label>Kết quả xử lý:</label>
                        <textarea
                            value={editingDocument.newReviewNote || ''}
                            onChange={e => onReviewNoteChange(e.target.value)}
                            className="form-textarea"
                            rows="4"
                            placeholder="Nhập kết quả xử lý..."
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-cancel" onClick={onClose}>
                        Hủy
                    </button>
                    <button className="btn btn-save" onClick={onSave}>
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

const DocumentsList = ({ searchTerm = '', selectedDepartment = '', selectedYear = '', statsFilter = '' }) => {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [editingDocument, setEditingDocument] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const itemsPerPage = 17

    const tableColumns = [
        {
            key: 'DocumentNo',
            label: 'Số hiệu',
            width: '100px',
            render: (value) => (
                <div
                    className="document-number-cell"
                    onMouseEnter={(e) => {
                        const element = e.currentTarget;
                        const tooltip = element.querySelector('.tooltip');

                        if (!tooltip || !value) return;

                        const isOverflowing = element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;

                        if (isOverflowing) {
                            tooltip.style.visibility = 'visible';
                            tooltip.style.opacity = '1';
                            const rect = element.getBoundingClientRect();

                            // compute tooltip size (may be 0 if not yet rendered fully)
                            const tooltipWidth = tooltip.offsetWidth || 200;
                            const tooltipHeight = tooltip.offsetHeight || 40;

                            // center tooltip horizontally over hovered element
                            let left = rect.left + (rect.width - tooltipWidth) / 2;
                            // clamp to viewport edges
                            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
                            left = Math.max(8, Math.min(left, windowWidth - tooltipWidth - 8));

                            // position tooltip above the element (preferred)
                            let top = rect.top - tooltipHeight - 8;
                            // if not enough space above, place below
                            if (top < 8) {
                                top = rect.bottom + 8;
                            }

                            // ensure tooltip uses fixed positioning and no CSS translate that would shift it
                            tooltip.style.position = 'fixed';
                            tooltip.style.transform = 'none';
                            tooltip.style.marginTop = '0px';
                            tooltip.style.zIndex = '10000';

                            tooltip.style.top = `${top}px`;
                            tooltip.style.left = `${left}px`;
                        }
                    }}
                    onMouseLeave={(e) => {
                        const tooltip = e.currentTarget.querySelector('.tooltip');
                        if (tooltip) {
                            tooltip.style.visibility = 'hidden';
                            tooltip.style.opacity = '0';
                        }
                    }}
                >
                    {value || 'N/A'}
                    {value && (
                        <div className="tooltip" style={{ visibility: 'hidden', opacity: '0' }}>
                            {value}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'DocumentSummary',
            label: 'Trích yếu',
            width: '250px',
            render: (value) => (
                <div
                    className="document-summary-cell"
                    onMouseEnter={(e) => {
                        const element = e.currentTarget;
                        const tooltip = element.querySelector('.tooltip');

                        if (!tooltip || !value) return;

                        const isOverflowing = element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;

                        if (isOverflowing) {
                            tooltip.style.visibility = 'visible';
                            tooltip.style.opacity = '1';
                            const rect = element.getBoundingClientRect();
                            tooltip.style.left = `${rect.left}px`;
                            tooltip.style.top = `${rect.top}px`;
                        }
                    }}
                    onMouseLeave={(e) => {
                        const tooltip = e.currentTarget.querySelector('.tooltip');
                        if (tooltip) {
                            tooltip.style.visibility = 'hidden';
                            tooltip.style.opacity = '0';
                        }
                    }}
                >
                    <span>{value || 'N/A'}</span>
                    {value && (
                        <div className="tooltip" style={{ visibility: 'hidden', opacity: '0' }}>
                            {value}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'CreatedDate',
            label: 'Ngày tạo',
            width: '110px',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'
        },
        {
            key: 'AssignedReviewedFullname',
            label: 'Lãnh đạo bút phê',
            width: '130px',
            render: (value) => value || 'Chưa'
        },
        {
            key: 'GroupName',
            label: 'Đơn vị xử lý chính',
            width: '170px',
            render: (value) => (
                <div
                    className="document-groupname-cell"
                    onMouseEnter={(e) => {
                        const element = e.currentTarget;
                        const tooltip = element.querySelector('.tooltip');

                        if (!tooltip || !value) return;

                        const isOverflowing = element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;

                        if (isOverflowing) {
                            tooltip.style.visibility = 'visible';
                            tooltip.style.opacity = '1';
                            const rect = element.getBoundingClientRect();

                            // compute tooltip size (may be 0 if not yet rendered fully)
                            const tooltipWidth = tooltip.offsetWidth || 200;
                            const tooltipHeight = tooltip.offsetHeight || 40;

                            // center tooltip horizontally over hovered element
                            let left = rect.left + (rect.width - tooltipWidth) / 2;
                            // clamp to viewport edges
                            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
                            left = Math.max(8, Math.min(left, windowWidth - tooltipWidth - 8));

                            // position tooltip above the element (preferred)
                            let top = rect.top - tooltipHeight - 8;
                            // if not enough space above, place below
                            if (top < 8) {
                                top = rect.bottom + 8;
                            }

                            // ensure tooltip uses fixed positioning and no CSS translate that would shift it
                            tooltip.style.position = 'fixed';
                            tooltip.style.transform = 'none';
                            tooltip.style.marginTop = '0px';
                            tooltip.style.zIndex = '10000';

                            tooltip.style.top = `${top}px`;
                            tooltip.style.left = `${left}px`;
                        }
                    }}
                    onMouseLeave={(e) => {
                        const tooltip = e.currentTarget.querySelector('.tooltip');
                        if (tooltip) {
                            tooltip.style.visibility = 'hidden';
                            tooltip.style.opacity = '0';
                        }
                    }}
                >
                    {value || ''}
                    {value && (
                        <div className="tooltip" style={{ visibility: 'hidden', opacity: '0' }}>
                            {value}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'CompletedDate',
            label: 'Ngày hoàn thành thực tế',
            width: '100px',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : ''
        },
        {
            key: 'UpdatedDate',
            label: 'Ngày cập nhật',
            width: '100px',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : ''
        },
        {
            key: 'ExpiredDate',
            label: 'Ngày hết hạn',
            width: '110px',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : ''
        },
        {
            key: 'Status',
            label: 'Trạng thái',
            width: '100px',
            render: (value, doc) => {
                // derive status from CompletedDate presence: if CompletedDate exists => completed, else pending
                const completedDate = doc?.CompletedDate;
                const statusText = getStatusText(completedDate);
                return (
                    <span className={`status-badge ${getStatusClass(completedDate)}`}>
                        {statusText}
                    </span>
                );
            }
        },
        {
            key: 'OutGoingDocs',
            label: 'Văn bản trả lời',
            width: '150px',
            render: (value) => value || 'Chưa có'
        },
        {
            key: 'ReviewNote',
            label: 'Mô tả xử lý',
            width: '150px',
            render: (value) => value || 'Không có'
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '80px',
            render: (value, doc) => (
                <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditClick(doc)}
                    title="Sửa trạng thái và ghi chú"
                >
                    ✏️ Sửa
                </button>
            )
        }
    ];

    const getStatusText = (completedDateOrStatus) => {
        // If a CompletedDate exists (non-falsy), treat as completed
        if (completedDateOrStatus) return 'Đã hoàn thành';
        return 'Chưa hoàn thành';
    };

    const getStatusClass = (completedDateOrStatus) => {
        if (completedDateOrStatus) return 'status-completed';
        return 'status-pending';
    };

    const handleEditClick = (document) => {
        setEditingDocument({
            ...document,
            newStatus: (document.OutGoingDocs || document.OutgoingDocs) ? 'Đã hoàn thành' : 'Chưa hoàn thành',
            newReviewNote: document.ReviewNote || '',
            selectedOutgoingDocument: document.OutgoingDocs || document.OutGoingDocs || null
        });
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setEditingDocument(null);
    };

    // status is now derived from outgoing document; no manual status change

    const handleReviewNoteChange = (value) => {
        setEditingDocument(prev => ({
            ...prev,
            newReviewNote: value
        }));
    };

    const handleOutgoingDocumentChange = (documentNo) => {
        setEditingDocument(prev => ({
            ...prev,
            selectedOutgoingDocument: documentNo
        }));
    };

    const handleSaveChanges = async () => {
        if (!editingDocument) return;

        try {
            console.log('Saving changes for document:', {
                DocumentID: editingDocument.DocumentID,
                ReviewNote: editingDocument.newReviewNote,
                OutgoingDocs: editingDocument.selectedOutgoingDocument
            });

            const response = await fetch(`http://localhost:3001/api/incoming-documents/${editingDocument.DocumentID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ReviewNote: editingDocument.newReviewNote,
                    OutgoingDocs: editingDocument.selectedOutgoingDocument
                })
            });

            console.log('API Response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('API Response data:', result);

                setDocuments(prevDocs =>
                    prevDocs.map(doc => {
                        if (doc.DocumentID !== editingDocument.DocumentID) return doc;

                        // Prefer explicit backend value (even if null or empty string).
                        const backend = result.data || {};
                        const newOutgoing = ('OutgoingDocs' in backend) ? backend.OutgoingDocs : (editingDocument.selectedOutgoingDocument ?? doc.OutGoingDocs ?? doc.OutgoingDocs);
                        const newCompleted = ('CompletedDate' in backend) ? backend.CompletedDate : doc.CompletedDate;

                        return {
                            ...doc,
                            Status: backend.Status ?? doc.Status,
                            ReviewNote: backend.ReviewNote ?? editingDocument.newReviewNote ?? doc.ReviewNote,
                            OutGoingDocs: newOutgoing,
                            OutgoingDocs: newOutgoing,
                            CompletedDate: newCompleted
                        };
                    })
                );
                handleCloseModal();
                alert('Cập nhật thành công!');
            } else {
                const errorData = await response.json();
                console.log('API Error response:', errorData);
                throw new Error(errorData.message || 'Lỗi khi cập nhật');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi cập nhật: ' + error.message);
        }
    }; useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3001/api/incoming-documents?view=MAIN_VIEW');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setDocuments(data.data);
                } else {
                    throw new Error(data.message || 'Lỗi không xác định');
                }
            } catch (err) {
                console.error('Lỗi fetch documents:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    // Reset current page when search term, department, year or stats filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedDepartment, selectedYear, statsFilter]);

    // Filter documents based on search term and department
    const filteredDocuments = documents.filter(doc => {
        // Filter by search term
        const matchesSearch = !searchTerm.trim() || (() => {
            const searchLower = searchTerm.toLowerCase();
            const documentNo = (doc.DocumentNo || '').toLowerCase();
            const documentSummary = (doc.DocumentSummary || '').toLowerCase();
            return documentNo.includes(searchLower) || documentSummary.includes(searchLower);
        })();

        // Filter by department
        const matchesDepartment = !selectedDepartment ||
            doc.AssignedGroupID?.toString() === selectedDepartment.toString();

        // Filter by year (CreatedDate)
        const matchesYear = (() => {
            if (!selectedYear) return true;
            const created = doc.CreatedDate;
            if (!created) return false;
            const year = new Date(created).getFullYear();
            return year === Number(selectedYear);
        })();

        // Filter by statistics selection if provided
        const matchesStatsFilter = (() => {
            if (!statsFilter) return true;

            switch (statsFilter) {
                case 'leader_done':
                    return !!(doc.AssignedReviewedFullname && String(doc.AssignedReviewedFullname).trim());
                case 'leader_undone':
                    return !(doc.AssignedReviewedFullname && String(doc.AssignedReviewedFullname).trim());
                case 'office_processed':
                    return !!doc.CompletedDate;
                case 'office_unprocessed':
                    return !doc.CompletedDate;
                default:
                    return true;
            }
        })();

        return matchesSearch && matchesDepartment && matchesYear && matchesStatsFilter;
    });

    const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

    // Ensure currentPage doesn't exceed totalPages
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const Pagination = () => {
        const pages = [];
        const maxVisiblePages = 5;

        // Ensure we have valid totalPages
        if (totalPages <= 1) return null;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (currentPage > 1) {
            pages.push(
                <button
                    key="prev"
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    ‹
                </button>
            );
        }

        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    className="pagination-btn"
                    onClick={() => handlePageChange(1)}
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(<span key="dots1" className="pagination-dots">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="dots2" className="pagination-dots">...</span>);
            }
            pages.push(
                <button
                    key={totalPages}
                    className="pagination-btn"
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        if (currentPage < totalPages) {
            pages.push(
                <button
                    key="next"
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    ›
                </button>
            );
        }

        return (
            <div className="pagination">
                <div className="pagination-info">
                    {filteredDocuments.length > 0 ? (
                        <>
                            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredDocuments.length)} của {filteredDocuments.length} kết quả
                            {searchTerm && ` (lọc từ ${documents.length} tổng cộng)`}
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

    return (
        <div className="documents-list">
            <div className="documents-table">
                <table>
                    <thead>
                        <tr>
                            {tableColumns.map(column => (
                                <th key={column.key} style={{ width: column.width }}>
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={tableColumns.length} className="loading-row">
                                    <div className="loading-content">
                                        <div className="loading-spinner"></div>
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={tableColumns.length} className="error-row">
                                    <div className="error-content">
                                        ❌ Lỗi: {error}
                                    </div>
                                </td>
                            </tr>
                        ) : currentDocuments.length > 0 ? (
                            currentDocuments.map(doc => (
                                <tr key={doc.DocumentID || doc.id}>
                                    {tableColumns.map(column => (
                                        <td key={column.key}>
                                            {column.render ? column.render(doc[column.key], doc) : (doc[column.key] || 'N/A')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableColumns.length} className="no-data">
                                    📋 Không có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {!loading && <Pagination />}
            <EditModal
                showEditModal={showEditModal}
                editingDocument={editingDocument}
                onClose={handleCloseModal}
                onSave={handleSaveChanges}
                onReviewNoteChange={handleReviewNoteChange}
                onOutgoingDocumentChange={handleOutgoingDocumentChange}
            />
        </div>
    )
}

export default DocumentsList