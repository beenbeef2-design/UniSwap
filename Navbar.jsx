import React from 'react';
import { GraduationCap, Coins, Search, LogOut, Wallet } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, account, onDisconnect, onConnectClick }) {
  return (
    <header style={styles.header}>
      {/* Brand logo in Uniswap style */}
      <div style={styles.brand} onClick={() => setActiveTab('swap')}>
        <div style={styles.logoContainer}>
          <GraduationCap size={24} color="#ffffff" style={styles.capIcon} />
          <div style={styles.logoArrows}>⇅</div>
        </div>
        <span style={styles.brandName}>UniSwap</span>
      </div>

      {/* Tabs */}
      <nav style={styles.nav}>
        <button
          onClick={() => setActiveTab('swap')}
          style={{
            ...styles.navLink,
            color: activeTab === 'swap' ? '#ffffff' : 'var(--text-secondary)',
            background: activeTab === 'swap' ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
          }}
        >
          교환
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          style={{
            ...styles.navLink,
            color: activeTab === 'explore' ? '#ffffff' : 'var(--text-secondary)',
            background: activeTab === 'explore' ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
          }}
        >
          둘러보기
        </button>
        <button
          onClick={() => setActiveTab('pools')}
          style={{
            ...styles.navLink,
            color: activeTab === 'pools' ? '#ffffff' : 'var(--text-secondary)',
            background: activeTab === 'pools' ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
          }}
        >
          대여 풀
        </button>
        <button
          onClick={() => setActiveTab('mypage')}
          style={{
            ...styles.navLink,
            color: activeTab === 'mypage' ? '#ffffff' : 'var(--text-secondary)',
            background: activeTab === 'mypage' ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
          }}
        >
          내 정보
        </button>
      </nav>

      {/* Search Input bar */}
      <div style={styles.searchBar}>
        <Search size={16} color="var(--text-secondary)" style={styles.searchIcon} />
        <input
          type="text"
          placeholder="대학명, 전공서적, 마우스 등 검색..."
          style={styles.searchInput}
          onFocus={(e) => {
            if (activeTab !== 'explore') setActiveTab('explore');
          }}
        />
      </div>

      {/* Account Info/Wallet action */}
      <div style={styles.rightSection}>
        {account ? (
          <div style={styles.accountCard}>
            {/* UniCredit Display */}
            <div style={styles.creditBadge}>
              <Coins size={14} color="#ff007a" />
              <span>{account.credits} UC</span>
            </div>
            
            {/* Connected account button */}
            <div style={styles.profileBadge}>
              <span style={styles.collegeBadge}>{account.college}</span>
              <span style={styles.usernameText}>
                {account.username.length > 10 ? `${account.username.slice(0, 10)}...` : account.username}
              </span>
              <button onClick={onDisconnect} style={styles.logoutBtn} title="로그아웃">
                <LogOut size={14} color="#ff4d4f" />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={onConnectClick} className="btn btn-primary" style={styles.connectBtn}>
            <Wallet size={16} />
            <span>대학 계정 연동</span>
          </button>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(8, 10, 14, 0.5)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 900
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  logoContainer: {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ff007a 0%, #7928ca 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(255, 0, 122, 0.3)'
  },
  capIcon: {
    transform: 'rotate(-10deg) translateY(-2px)'
  },
  logoArrows: {
    position: 'absolute',
    bottom: '2px',
    right: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#ffffff',
    background: 'rgba(0, 0, 0, 0.4)',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandName: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.5px',
    background: 'linear-gradient(90deg, #ffffff 0%, #ffc0e0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '4px',
    borderRadius: '18px',
    border: '1px solid var(--border-color)'
  },
  navLink: {
    border: 'none',
    padding: '8px 16px',
    fontSize: '14.5px',
    fontWeight: '500',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '8px 16px',
    width: '100%',
    maxWidth: '280px',
    transition: 'all 0.2s',
    ':focus-within': {
      backgroundColor: 'rgba(255, 255, 255, 0.07)',
      borderColor: 'var(--border-focus)'
    }
  },
  searchIcon: {
    marginRight: '8px'
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '13.5px',
    outline: 'none',
    width: '100%'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  connectBtn: {
    padding: '10px 18px',
    fontSize: '14px',
    fontFamily: 'var(--font-sans)',
    boxShadow: '0 4px 15px rgba(255, 0, 122, 0.2)'
  },
  accountCard: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '18px',
    padding: '3px'
  },
  creditBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff'
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '15px',
    padding: '5px 10px 5px 12px'
  },
  collegeBadge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'rgba(255, 0, 122, 0.1)',
    color: 'var(--primary-color)',
    padding: '2px 6px',
    borderRadius: '8px'
  },
  usernameText: {
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#ffffff'
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 77, 79, 0.1)'
    }
  }
};
