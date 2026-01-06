import React, { useState } from 'react'
import './Login.css'

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showModeSelection, setShowModeSelection] = useState(false)
    const [userData, setUserData] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        console.log('[Login] handleSubmit called with username:', username)

        if (!username || !password) {
            setError('Vui lòng nhập tên đăng nhập và mật khẩu.')
            console.log('[Login] Missing username or password')
            return
        }

        setLoading(true)
        console.log('[Login] Starting login API call...')

        try {
            const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'
            console.log('[Login] API_BASE:', API_BASE)

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            const data = await response.json()
            console.log('[Login] API Response:', data)

            if (!response.ok || !data.success) {
                setError(data.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
                setLoading(false)
                return
            }

            // Lưu user data từ API
            console.log('[Login] User data from API:', data.data)
            setUserData(data.data)
            setShowModeSelection(true)
            setLoading(false)

        } catch (error) {
            console.error('[Login] Error:', error)
            if (error.name === 'AbortError') {
                setError('Request timeout - Server không phản hồi. Kiểm tra Auth Service.')
            } else {
                setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.')
            }
            setLoading(false)
        }
    }

    const handleModeSelection = (mode) => {
        console.log('[Login] Mode selected:', mode)
        console.log('[Login] userData:', userData)
        console.log('[Login] username:', username)

        const finalUserData = { ...userData, username, mode }
        console.log('[Login] Sending to App:', finalUserData)

        // Gửi đầy đủ user data + mode về App
        onLogin(finalUserData)
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <div className="illustration">
                        <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Gears */}
                            <circle cx="140" cy="100" r="25" fill="#A8C5E0" opacity="0.6" />
                            <circle cx="200" cy="140" r="30" fill="#A8C5E0" opacity="0.6" />

                            {/* People */}
                            <ellipse cx="100" cy="220" rx="50" ry="8" fill="#FFC857" opacity="0.3" />
                            <rect x="85" y="180" width="30" height="40" rx="5" fill="#4A90E2" />
                            <circle cx="100" cy="165" r="15" fill="#FFB6A3" />

                            <ellipse cx="250" cy="230" rx="45" ry="7" fill="#FFC857" opacity="0.3" />
                            <rect x="238" y="195" width="25" height="35" rx="5" fill="#E85D75" />
                            <circle cx="250" cy="182" r="12" fill="#FFB6A3" />

                            <ellipse cx="320" cy="210" rx="40" ry="6" fill="#FFC857" opacity="0.3" />
                            <rect x="310" y="175" width="22" height="35" rx="4" fill="#5FB35F" />
                            <circle cx="320" cy="163" r="11" fill="#FFB6A3" />

                            {/* Flag */}
                            <path d="M280 80 L280 160" stroke="#E85D75" strokeWidth="3" />
                            <path d="M280 80 L320 95 L280 110" fill="#E85D75" />

                            {/* Arrow */}
                            <path d="M200 100 L280 60" stroke="#FFC857" strokeWidth="4" strokeLinecap="round" />
                            <path d="M280 60 L270 65 L275 70" fill="#FFC857" />
                        </svg>
                    </div>
                </div>

                <div className="login-right">
                    <div className="login-header">
                        <h1>VĂN PHÒNG ĐIỆN TỬ</h1>
                        <h2>PORTALOFFICE</h2>
                    </div>

                    {!showModeSelection ? (
                        <form className="login-form" onSubmit={handleSubmit}>
                            {error && <div className="error">{error}</div>}

                            <div className="input-group">
                                <span className="input-icon">✉</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Tên đăng nhập"
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mật khẩu"
                                    disabled={loading}
                                />
                            </div>

                            <button className="btn-login" type="submit" disabled={loading}>
                                {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
                            </button>
                        </form>
                    ) : (
                        <div className="mode-selection">
                            <h3 className="mode-title">Chọn chức năng</h3>
                            <button
                                className="mode-button documents-mode"
                                onClick={() => handleModeSelection('documents')}
                            >
                                <span className="mode-icon">📄</span>
                                <span className="mode-label">Tra cứu công văn</span>
                            </button>
                            <button
                                className="mode-button weekly-mode"
                                onClick={() => handleModeSelection('weeklyReport')}
                            >
                                <span className="mode-icon">📝</span>
                                <span className="mode-label">Báo cáo tuần</span>
                            </button>
                        </div>
                    )}

                    <div className="login-footer">
                        www.vanphongdientu.com.vn
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
