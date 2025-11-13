import React, { useState } from 'react'
import './Login.css'

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        if (!username || !password) {
            setError('Vui lòng nhập tên đăng nhập và mật khẩu.')
            return
        }

        const user = { username, name: username }
        onLogin(user)
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Đăng nhập</h2>
                {error && <div className="error">{error}</div>}
                <label className="field">
                    <span>Tên đăng nhập</span>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nhập tên đăng nhập"
                    />
                </label>

                <label className="field">
                    <span>Mật khẩu</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                    />
                </label>

                <button className="btn" type="submit">Đăng nhập</button>
            </form>
        </div>
    )
}

export default Login
