import React from 'react'
import './Header.css'

const Header = ({ user, onLogout }) => {
    return (
        <header className="header">
            <div className="header-left">
                <h1 className="header-title">HỆ THỐNG CÔNG VĂN CŨ</h1>
            </div>
            <div className="header-right">
                {user ? (
                    <>
                        <div className="user-info">
                            <div className="user-avatar">
                                {(user.fullName || user.name || user.username)?.charAt(0).toUpperCase()}
                            </div>
                            <span className="user-name">{user.fullName || user.name || user.username}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="logout-button"
                        >
                            🚪 Đăng xuất
                        </button>
                    </>
                ) : (
                    <button className="login-button">
                        Đăng nhập
                    </button>
                )}
            </div>
        </header>
    )
}

export default Header