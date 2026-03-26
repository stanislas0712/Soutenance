import { useState } from 'react'
import UserList from './components/UserList.jsx'
import PostList from './components/PostList.jsx'

const TABS = ['Users', 'Posts']

export default function App() {
  const [activeTab, setActiveTab] = useState('Users')

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#111827' }}>
          Fullstack Demo
        </h1>
        <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 14 }}>
          Users & Posts — REST API + React
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #E5E7EB', marginBottom: 28 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === tab ? '#2563EB' : '#6B7280',
              borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
              marginBottom: -2,
              transition: 'all .15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'Users' && <UserList />}
      {activeTab === 'Posts' && <PostList />}
    </div>
  )
}
