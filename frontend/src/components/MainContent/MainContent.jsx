import React, { useState, useEffect } from 'react'
import './MainContent.css'
import DocumentsList from '../DocumentsList/DocumentsList'
import StatisticsTable from '../StatisticsTable/StatisticsTable'
import SearchBar from '../SearchBar/SearchBar'

const MainContent = () => {
    const [activeTab, setActiveTab] = useState('documents')
    const [searchTerm, setSearchTerm] = useState('')
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [selectedYear, setSelectedYear] = useState('')
    const [statsFilter, setStatsFilter] = useState('')
    const [departments, setDepartments] = useState([])

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

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value)
    }

    // Fetch departments list
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/departments')
                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        setDepartments(data.data)
                    }
                }
            } catch (error) {
                console.error('Error fetching departments:', error)
            }
        }

        fetchDepartments()
    }, [])

    const resetAllFilters = () => {
        setSearchTerm('')
        setAppliedSearchTerm('')
        setSelectedDepartment('')
        setSelectedYear('')
        setStatsFilter('')
    }

    return (
        <div className="main-content">
            <div className="content-area-full">
                <div className="content-header">
                    <div className="header-left">
                        <div className="tabs">
                            <button
                                className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
                                onClick={() => setActiveTab('documents')}
                            >
                                Danh sách công văn
                            </button>
                            <button
                                className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('statistics')}
                            >
                                Thống kê trạng thái
                            </button>
                        </div>
                        {activeTab === 'documents' && (
                            <SearchBar
                                searchTerm={searchTerm}
                                onSearchChange={handleSearchChange}
                                onSearchSubmit={handleSearchSubmit}
                                onClearSearch={handleClearSearch}
                                placeholder="Tìm kiếm theo số hiệu hoặc trích yếu..."
                            />
                        )}
                    </div>
                    {activeTab === 'documents' && (
                        <div className="department-filter">
                            <select
                                id="department-select"
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                className="department-select"
                            >
                                <option value="">-- Tất cả đơn vị --</option>
                                {departments.map(dept => (
                                    <option key={dept.GroupID} value={dept.GroupID}>
                                        {dept.GroupName}
                                    </option>
                                ))}
                            </select>

                            <select
                                id="year-select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="department-select"
                                style={{ minWidth: 120, marginLeft: 6 }}
                            >
                                <option value="">-- Tất cả năm --</option>
                                {[2025, 2024, 2023, 2022, 2021].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            <select
                                id="stats-filter"
                                value={statsFilter}
                                onChange={(e) => setStatsFilter(e.target.value)}
                                className="department-select"
                                style={{ minWidth: 200, marginLeft: 6 }}
                            >
                                <option value="">-- Không lọc --</option>
                                <option value="leader_done">Văn bản đã bút phê</option>
                                <option value="leader_undone">Văn bản chưa bút phê</option>
                                <option value="office_processed">Văn bản đã xử lí</option>
                                <option value="office_unprocessed">Văn bản chưa xử lí</option>
                            </select>

                            {/* Reset all filters button: appears only when any filter is active */}
                            {(
                                searchTerm || appliedSearchTerm || selectedDepartment || selectedYear || statsFilter
                            ) && (
                                    <button
                                        onClick={resetAllFilters}
                                        style={{ marginLeft: 12 }}
                                        className="add-btn"
                                        title="Làm mới tất cả bộ lọc"
                                    >
                                        Làm mới
                                    </button>
                                )}
                        </div>
                    )}
                </div>

                {activeTab === 'documents' && <DocumentsList searchTerm={appliedSearchTerm} selectedDepartment={selectedDepartment} selectedYear={selectedYear} statsFilter={statsFilter} clearStatsFilter={() => setStatsFilter('')} />}
                {activeTab === 'statistics' && <StatisticsTable onFilterSelect={(filterKey) => { setStatsFilter(filterKey); setActiveTab('documents'); }} />}
            </div>
        </div>
    )
}

export default MainContent