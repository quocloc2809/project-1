import React, { useState, useEffect } from 'react'
import './MainContent.css'
import DocumentsList from '../DocumentsList/DocumentsList'
import WeeklyReport from '../WeeklyReport/WeeklyReport'
import SearchBar from '../SearchBar/SearchBar'

const MainContent = ({ mode = 'documents' }) => {
    const [activeTab, setActiveTab] = useState(mode === 'weeklyReport' ? 'weeklyReport' : 'incoming')
    const [searchTerm, setSearchTerm] = useState('')
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [selectedYear, setSelectedYear] = useState('')
    const [departments, setDepartments] = useState([])
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [isLoadingDepts, setIsLoadingDepts] = useState(true)

    // Temporary filter states trong modal
    const [tempDepartment, setTempDepartment] = useState('')
    const [tempYear, setTempYear] = useState('')

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleSearchSubmit = () => {
        setAppliedSearchTerm(searchTerm)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setAppliedSearchTerm('')
    }

    const handleOpenFilterModal = () => {
        // Copy giá trị hiện tại vào temp states
        setTempDepartment(selectedDepartment)
        setTempYear(selectedYear)
        setShowFilterModal(true)
    }

    const handleApplyFilters = () => {
        setSelectedDepartment(tempDepartment)
        setSelectedYear(tempYear)
        setShowFilterModal(false)
    }

    const handleCancelFilter = () => {
        setShowFilterModal(false)
    }

    const handleExportReport = async () => {
        try {
            const params = new URLSearchParams()

            // Thêm các tham số lọc nếu có
            if (appliedSearchTerm && appliedSearchTerm.trim() !== '') {
                params.append('searchTerm', appliedSearchTerm)
            }
            if (selectedDepartment && selectedDepartment !== '') {
                params.append('departmentId', selectedDepartment)
            }
            if (selectedYear && selectedYear !== '') {
                params.append('year', selectedYear)
            }

            const url = `http://localhost:3001/api/incoming-documents-mvc/export?${params.toString()}`

            // Tạo link download
            const link = document.createElement('a')
            link.href = url
            link.download = 'BaoCao_CongVanDen.xlsx'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Lỗi xuất báo cáo:', error)
            alert('Có lỗi xảy ra khi xuất báo cáo')
        }
    }

    // Fetch departments list
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                console.log('[MainContent] Fetching departments...')
                const response = await fetch('http://localhost:3001/api/departments')
                console.log('[MainContent] Departments response:', response.status)
                if (response.ok) {
                    const data = await response.json()
                    console.log('[MainContent] Departments data:', data)
                    if (data.success) {
                        setDepartments(data.data)
                    }
                }
            } catch (error) {
                console.error('[MainContent] Error fetching departments:', error)
            } finally {
                setIsLoadingDepts(false)
            }
        }

        fetchDepartments()
    }, [])

    const resetAllFilters = () => {
        setSearchTerm('')
        setAppliedSearchTerm('')
        setSelectedDepartment('')
        setSelectedYear('')
        setTempDepartment('')
        setTempYear('')
    }

    // Kiểm tra có filter nào đang active không
    const hasActiveFilters = selectedDepartment || selectedYear

    console.log('[MainContent] Rendering with mode:', mode, 'isLoadingDepts:', isLoadingDepts)

    if (isLoadingDepts) {
        return (
            <div className="main-content-wrapper">
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    Đang tải...
                </div>
            </div>
        )
    }

    return (
        <div className="main-content-wrapper">
            <div className="content-container">
                <div className="content-header-gradient">
                    <div className="header-content">
                        <div className="header-left-section">
                            {mode === 'documents' ? (
                                <>
                                    <div className="tabs-container">
                                        <button
                                            className={`tab-button ${activeTab === 'incoming' ? 'active' : 'inactive'}`}
                                            onClick={() => setActiveTab('incoming')}
                                        >
                                            📥 Văn bản đến
                                        </button>
                                        <button
                                            className={`tab-button ${activeTab === 'outgoing' ? 'active' : 'inactive'}`}
                                            onClick={() => setActiveTab('outgoing')}
                                        >
                                            📤 Văn bản đi
                                        </button>
                                    </div>
                                    <SearchBar
                                        searchTerm={searchTerm}
                                        onSearchChange={handleSearchChange}
                                        onSearchSubmit={handleSearchSubmit}
                                        onClearSearch={handleClearSearch}
                                        placeholder="Tìm kiếm theo số hiệu hoặc trích yếu..."
                                    />
                                </>
                            ) : (
                                <div className="tabs-container">
                                    <button className="tab-button active">
                                        📝 Báo cáo tuần
                                    </button>
                                </div>
                            )}
                        </div>
                        {mode === 'documents' && (
                            <div className="header-actions">
                                <button
                                    onClick={handleOpenFilterModal}
                                    className={`filter-button ${hasActiveFilters ? 'active' : 'inactive'}`}
                                    title="Mở bộ lọc"
                                >
                                    🔍 Lọc dữ liệu
                                    {hasActiveFilters && (
                                        <span className="filter-badge">
                                            {[selectedDepartment, selectedYear].filter(Boolean).length}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={handleExportReport}
                                    className="export-button"
                                    title="Xuất báo cáo Excel"
                                >
                                    📊 Xuất báo cáo
                                </button>

                                {(searchTerm || appliedSearchTerm || hasActiveFilters) && (
                                    <button
                                        onClick={resetAllFilters}
                                        className="reset-button"
                                        title="Làm mới tất cả bộ lọc"
                                    >
                                        🔄 Làm mới
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="tab-content-wrapper">
                    {mode === 'documents' ? (
                        <>
                            <div className={`tab-content ${activeTab === 'incoming' ? 'active' : ''}`}>
                                <DocumentsList searchTerm={appliedSearchTerm} selectedDepartment={selectedDepartment} selectedYear={selectedYear} documentType="incoming" />
                            </div>
                            <div className={`tab-content ${activeTab === 'outgoing' ? 'active' : ''}`}>
                                <DocumentsList searchTerm={appliedSearchTerm} selectedDepartment={selectedDepartment} selectedYear={selectedYear} documentType="outgoing" />
                            </div>
                        </>
                    ) : (
                        <div className="tab-content active">
                            <WeeklyReport />
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="filter-modal-header">
                            <h3 className="filter-modal-title">Bộ lọc dữ liệu</h3>
                            <button
                                onClick={handleCancelFilter}
                                className="filter-modal-close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="filter-modal-body">
                            {/* Đơn vị */}
                            <div className="filter-field">
                                <label className="filter-label-wrapper">
                                    Đơn vị
                                </label>
                                <div className="filter-select-wrapper">
                                    <select
                                        value={tempDepartment}
                                        onChange={(e) => setTempDepartment(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">Tất cả đơn vị</option>
                                        {departments.map(dept => (
                                            <option key={dept.GroupID} value={dept.GroupID}>
                                                {dept.GroupName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Năm */}
                            <div className="filter-field">
                                <label className="filter-label-wrapper">
                                    Năm
                                </label>
                                <div className="filter-select-wrapper">
                                    <select
                                        value={tempYear}
                                        onChange={(e) => setTempYear(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">Tất cả năm</option>
                                        {[2025, 2024, 2023, 2022, 2021].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={handleCancelFilter}
                                className="filter-cancel-button"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleApplyFilters}
                                className="filter-apply-button"
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MainContent