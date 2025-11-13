import React, { useState, useEffect } from 'react'
import './StatisticsTable.css'

// Use an environment variable if provided, otherwise default to localhost:3001
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

const StatisticsTable = ({ onFilterSelect }) => {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    // no local selection state required; selection is lifted to parent via onFilterSelect

    // Fetch statistics from backend (incoming-documents endpoint includes stats)
    useEffect(() => {
        let mounted = true
        const load = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${API_BASE}/api/incoming-documents`)
                const json = await res.json()
                console.log('Statistics API response:', json)
                if (!mounted) return
                if (json && json.success && json.stats) {
                    setStats(json.stats)
                } else {
                    setStats(null)
                }
            } catch (err) {
                console.error('Error loading statistics:', err)
                setStats(null)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        return () => { mounted = false }
    }, [])

    const handleSelect = (key) => {
        if (onFilterSelect) onFilterSelect(key)
    }

    return (
        <div className="statistics-container">
            {loading ? (
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <span>Đang tải thống kê...</span>
                </div>
            ) : (
                <div className="stats-grid">
                    <div className="stats-card">
                        <div className="stats-card-header">Văn bản của lãnh đạo</div>
                        <div className="stats-card-body">
                            {(() => {
                                const leaderDone = stats && stats.leader ? (stats.leader.done ?? 0) : 0
                                const leaderUndone = stats && stats.leader ? (stats.leader.undone ?? Math.max(0, (stats.leader.total || 0) - leaderDone)) : 0
                                return [
                                    { key: 'leader_done', label: 'Văn bản đã bút phê', count: leaderDone },
                                    { key: 'leader_undone', label: 'Văn bản chưa bút phê', count: leaderUndone }
                                ].map((it, i) => (
                                    <div key={i} className="stats-item">
                                        <div className="stats-label">{it.label}</div>
                                        <button className="stats-value" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, fontWeight: 700 }} onClick={() => handleSelect(it.key)}>{it.count}</button>
                                    </div>
                                ))
                            })()}
                        </div>
                    </div>

                    <div className="stats-card">
                        <div className="stats-card-header">Văn bản của văn phòng</div>
                        <div className="stats-card-body">
                            {(() => {
                                const processed = stats && stats.office ? stats.office.processed : 0
                                const unprocessed = stats && stats.office ? stats.office.unprocessed : 0
                                return [
                                    { key: 'office_processed', label: 'Văn bản đã xử lí', count: processed },
                                    { key: 'office_unprocessed', label: 'Văn bản chưa xử lí', count: unprocessed }
                                ].map((it, i) => (
                                    <div key={i} className="stats-item">
                                        <div className="stats-label">{it.label}</div>
                                        <button className="stats-value" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, fontWeight: 700 }} onClick={() => handleSelect(it.key)}>{it.count}</button>
                                    </div>
                                ))
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StatisticsTable