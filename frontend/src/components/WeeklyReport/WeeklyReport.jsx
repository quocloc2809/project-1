import React, { useState } from 'react'
import './WeeklyReport.css'
import { DataTable } from '../common'

const WeeklyReport = () => {
    const [reports, setReports] = useState([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)

    // Hàm tính ngày đầu và cuối tuần hiện tại
    const getCurrentWeekDates = () => {
        const today = new Date()
        const dayOfWeek = today.getDay() // 0 (Chủ nhật) -> 6 (Thứ 7)
        const monday = new Date(today)

        // Tính ngày thứ 2 (đầu tuần)
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        monday.setDate(today.getDate() + diff)

        // Tính ngày Chủ nhật (cuối tuần)
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)

        return {
            start: monday.toISOString().split('T')[0],
            end: sunday.toISOString().split('T')[0]
        }
    }

    const weekDates = getCurrentWeekDates()
    const [startDate, setStartDate] = useState(weekDates.start)
    const [endDate, setEndDate] = useState(weekDates.end)
    const [newReport, setNewReport] = useState({
        DocumentNo: '',
        DocumentSummary: '',
        CreatedDate: '',
        AssignedReviewedFullname: '',
        GroupName: '',
        CompletedDate: '',
        ExpiredDate: '',
    })



    // Filter reports by date range
    const filteredReports = (startDate || endDate)
        ? reports.filter(report => {
            const reportDate = new Date(report.CreatedDate)
            const start = startDate ? new Date(startDate) : null
            const end = endDate ? new Date(endDate) : null

            if (start && end) {
                return reportDate >= start && reportDate <= end
            } else if (start) {
                return reportDate >= start
            } else if (end) {
                return reportDate <= end
            }
            return true
        })
        : reports

    const handleAddReport = () => {
        if (!newReport.DocumentNo || !newReport.DocumentSummary) {
            alert('Vui lòng điền ít nhất Số hiệu và Trích yếu')
            return
        }

        const report = {
            id: Date.now(),
            DocumentNo: newReport.DocumentNo,
            DocumentSummary: newReport.DocumentSummary,
            AssignedReviewedFullname: newReport.AssignedReviewedFullname,
            GroupName: newReport.GroupName,
            CreatedDate: newReport.CreatedDate || new Date().toISOString().split('T')[0],
            CompletedDate: newReport.CompletedDate,
            ExpiredDate: newReport.ExpiredDate,
        }

        setReports([report, ...reports]) // Thêm vào đầu danh sách
        setNewReport({
            DocumentNo: '',
            DocumentSummary: '',
            AssignedReviewedFullname: '',
            GroupName: '',
            CreatedDate: '',
            CompletedDate: '',
            ExpiredDate: '',
        })
        setShowAddModal(false)
    }

    const handleApplyDateFilter = () => {
        setShowDatePicker(false)
    }

    // Define table columns
    const tableColumns = [
        {
            key: 'stt',
            label: 'STT',
            width: '60px',
            render: (value, row, index) => index + 1
        },
        {
            key: 'DocumentNo',
            label: 'Số hiệu',
            width: '100px',
            render: (value) => value || 'N/A'
        },
        {
            key: 'DocumentSummary',
            label: 'Trích yếu',
            width: '250px',
            render: (value) => value || 'N/A'
        },
        {
            key: 'AssignedReviewedFullname',
            label: 'Lãnh đạo bút phê',
            width: '150px',
            render: (value) => value || 'Chưa'
        },
        {
            key: 'GroupName',
            label: 'Đơn vị xử lý',
            width: '150px',
            render: (value) => value || 'N/A'
        },
        {
            key: 'CreatedDate',
            label: 'Ngày tạo',
            width: '110px',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'
        },
        {
            key: 'CompletedDate',
            label: 'Ngày hoàn thành',
            width: '110px',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : ''
        },
        {
            key: 'ExpiredDate',
            label: 'Ngày hết hạn',
            width: '110px',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : ''
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '120px',
            render: (value, row) => (
                <span className={`status-badge ${row.CompletedDate ? 'status-completed' : 'status-pending'}`}>
                    {row.CompletedDate ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Thao tác',
            width: '100px',
            render: () => (
                <>
                    <button className="action-btn edit-btn" title="Sửa">✏️</button>
                    <button className="action-btn delete-btn" title="Xóa">🗑️</button>
                </>
            )
        }
    ]

    return (
        <div className="weekly-report">
            <div className="weekly-report-header">
                <button
                    className="add-report-btn"
                    onClick={() => setShowAddModal(true)}
                >
                    ➕ Thêm văn bản
                </button>
                <button
                    className="date-filter-btn"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                >
                    📅 Chọn thời gian: <span className="date-range-text">
                        {startDate && endDate ? `${startDate} đến ${endDate}` :
                            startDate ? `Từ ${startDate}` :
                                endDate ? `Đến ${endDate}` : 'Tất cả'}
                    </span>
                </button>
            </div>

            <DataTable
                columns={tableColumns}
                data={filteredReports}
                loading={false}
                error={null}
                emptyMessage="Không có dữ liệu"
                enablePagination={true}
                minItems={5}
                maxItems={15}
                headerHeight={80}
            />

            {/* Date Picker Modal */}
            {showDatePicker && (
                <div className="modal-overlay" onClick={() => setShowDatePicker(false)}>
                    <div className="date-picker-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chọn khoảng thời gian</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowDatePicker(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Từ ngày</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Đến ngày</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowDatePicker(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-save"
                                onClick={handleApplyDateFilter}
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Report Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Thêm văn bản mới</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowAddModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Số hiệu <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="VD: CV001/2025"
                                    value={newReport.DocumentNo}
                                    onChange={(e) => setNewReport({ ...newReport, DocumentNo: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Trích yếu <span style={{ color: 'red' }}>*</span></label>
                                <textarea
                                    placeholder="Nhập trích yếu văn bản"
                                    rows="3"
                                    value={newReport.DocumentSummary}
                                    onChange={(e) => setNewReport({ ...newReport, DocumentSummary: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày tạo</label>
                                <input
                                    type="date"
                                    value={newReport.CreatedDate}
                                    onChange={(e) => setNewReport({ ...newReport, CreatedDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Lãnh đạo bút phê</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên lãnh đạo"
                                    value={newReport.AssignedReviewedFullname}
                                    onChange={(e) => setNewReport({ ...newReport, AssignedReviewedFullname: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Đơn vị xử lý chính</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên đơn vị"
                                    value={newReport.GroupName}
                                    onChange={(e) => setNewReport({ ...newReport, GroupName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày hoàn thành</label>
                                <input
                                    type="date"
                                    value={newReport.CompletedDate}
                                    onChange={(e) => setNewReport({ ...newReport, CompletedDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày cập nhật</label>
                                <input
                                    type="date"
                                    value={newReport.UpdatedDate}
                                    onChange={(e) => setNewReport({ ...newReport, UpdatedDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày hết hạn</label>
                                <input
                                    type="date"
                                    value={newReport.ExpiredDate}
                                    onChange={(e) => setNewReport({ ...newReport, ExpiredDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Văn bản trả lời</label>
                                <input
                                    type="text"
                                    placeholder="Nhập số văn bản trả lời"
                                    value={newReport.OutGoingDocs}
                                    onChange={(e) => setNewReport({ ...newReport, OutGoingDocs: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả xử lý</label>
                                <textarea
                                    placeholder="Nhập mô tả xử lý"
                                    rows="3"
                                    value={newReport.ReviewNote}
                                    onChange={(e) => setNewReport({ ...newReport, ReviewNote: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowAddModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-save"
                                onClick={handleAddReport}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default WeeklyReport
