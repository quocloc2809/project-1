import React, { useState, useEffect } from 'react'
import './DocumentsList.css'
import Tooltip from '../Tooltip/Tooltip'
import DataTable from '../common/DataTable/DataTable'

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

const DocumentsList = ({ searchTerm = '', selectedDepartment = '', selectedYear = '', documentType = 'incoming' }) => {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editingDocument, setEditingDocument] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)



    // Download associated file for a given document
    function handleDownload(documentId, doc = {}) {
        return (async () => {
            try {
                const resp = await fetch(`http://localhost:3001/api/files/download/${documentId}`);
                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    alert(err.message || 'Không tìm thấy file để tải.');
                    return;
                }

                const blob = await resp.blob();
                // Try to read filename from content-disposition header
                const cd = resp.headers.get('content-disposition') || '';
                let filename = doc.DocumentNo ? `${doc.DocumentNo}` : `document_${documentId}`;
                const m = /filename=?([^";]+)/.exec(cd);
                if (m && m[1]) filename = m[1].replace(/"/g, '');

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Download error:', error);
                alert('Lỗi khi tải file: ' + (error.message || ''));
            }
        })();
    }

    const tableColumns = documentType === 'outgoing' ? [
        {
            key: 'DocumentNo',
            label: 'Số hiệu',
            width: '100px',
            render: (value) => (
                <Tooltip text={value} className="document-number-cell">
                    {value || 'N/A'}
                </Tooltip>
            )
        },
        {
            key: 'DocumentSummary',
            label: 'Trích yếu',
            width: '250px',
            render: (value) => (
                <Tooltip text={value} className="document-summary-cell">
                    {value || 'N/A'}
                </Tooltip>
            )
        },
        {
            key: 'CreatedDate',
            label: 'Ngày tạo',
            width: '110px',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'
        },
        {
            key: 'SignerInfo',
            label: 'Người ký',
            width: '180px',
            render: (value, doc) => {
                const fullname = doc.SignerFullname || '';
                const position = doc.SignerPosition || '';
                return fullname && position ? `${fullname} - ${position}` : (fullname || position || 'Chưa có');
            }
        },
        {
            key: 'GroupName',
            label: 'Đơn vị ban hành',
            width: '170px',
            render: (value) => (
                <Tooltip text={value} className="document-groupname-cell">
                    {value || ''}
                </Tooltip>
            )
        },
        {
            key: 'ExpiredDate',
            label: 'Ngày hết hạn',
            width: '110px',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : ''
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '100px',
            render: (value, doc) => (
                <div className="action-buttons-container">
                    <button
                        className="action-btn download-btn"
                        onClick={() => handleDownload(doc.DocumentID, doc)}
                        title="Tải file đính kèm"
                    >
                        ⬇️
                    </button>
                </div>
            )
        }
    ] : [
        {
            key: 'DocumentNo',
            label: 'Số hiệu',
            width: '100px',
            render: (value) => (
                <Tooltip text={value} className="document-number-cell">
                    {value || 'N/A'}
                </Tooltip>
            )
        },
        {
            key: 'DocumentSummary',
            label: 'Trích yếu',
            width: '250px',
            render: (value) => (
                <Tooltip text={value} className="document-summary-cell">
                    {value || 'N/A'}
                </Tooltip>
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
                <Tooltip text={value} className="document-groupname-cell">
                    {value || ''}
                </Tooltip>
            )
        },
        {
            key: 'ExpiredDate',
            label: 'Ngày hết hạn',
            width: '110px',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : ''
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '100px',
            render: (value, doc) => (
                <div className="action-buttons-container">
                    <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditClick(doc)}
                        title="Sửa trạng thái và ghi chú"
                    >
                        ✏️
                    </button>
                    <button
                        className="action-btn download-btn"
                        onClick={() => handleDownload(doc.DocumentID, doc)}
                        title="Tải file đính kèm"
                    >
                        ⬇️
                    </button>
                </div>
            )
        }
    ];

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
                const endpoint = documentType === 'incoming'
                    ? 'http://localhost:3001/api/incoming-documents?view=MAIN_VIEW'
                    : 'http://localhost:3001/api/outgoing-documents';

                const response = await fetch(endpoint);

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
    }, [documentType]);

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

        return matchesSearch && matchesDepartment && matchesYear;
    });

    return (
        <div className="documents-list">
            <DataTable
                columns={tableColumns}
                data={filteredDocuments}
                loading={loading}
                error={error}
                emptyMessage="Không có dữ liệu"
                searchTerm={searchTerm}
                enablePagination={true}
                minItems={5}
                maxItems={15}
                headerHeight={0}
            />
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