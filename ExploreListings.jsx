import React, { useState } from 'react';
import { Search, Tag, User, HelpCircle, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { CATEGORIES, UNIVERSITIES } from '../utils/mockData';

export default function ExploreListings({ listings, onSelectSwapItem, account }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedUniFilter, setSelectedUniFilter] = useState('all');
  const [expandedItemId, setExpandedItemId] = useState(null);

  // Filter listings
  const filteredListings = listings.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesUni = selectedUniFilter === 'all' || item.college === selectedUniFilter;
    return matchesSearch && matchesCategory && matchesUni;
  });

  const getCategoryEmoji = (cat) => {
    switch(cat) {
      case 'books': return '📚';
      case 'electronics': return '💻';
      case 'daily': return '🧴';
      case 'fashion': return '👕';
      default: return '📦';
    }
  };

  const getUniColor = (uniName) => {
    const uni = UNIVERSITIES.find(u => u.name === uniName);
    return uni ? uni.color : '#ff007a';
  };

  return (
    <div style={styles.container} className="fade-in">
      {/* Top dashboard stats */}
      <div style={styles.statsStrip}>
        <div style={styles.statCard} className="glass-card">
          <span style={styles.statLabel}>24h 매칭 건수</span>
          <span style={styles.statValue}>14건 <span style={styles.statTrend}>+12.4%</span></span>
        </div>
        <div style={styles.statCard} className="glass-card">
          <span style={styles.statLabel}>전체 등록 매물</span>
          <span style={styles.statValue}>{listings.length}개</span>
        </div>
        <div style={styles.statCard} className="glass-card">
          <span style={styles.statLabel}>총 거래 금액</span>
          <span style={styles.statValue}>4,820 UC</span>
        </div>
        <div style={styles.statCard} className="glass-card">
          <span style={styles.statLabel}>활성 학생 회원</span>
          <span style={styles.statValue}>542명 <span style={styles.statTrend}>+4.8%</span></span>
        </div>
      </div>

      {/* Header and Controls */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>캠퍼스 매물 둘러보기</h2>
          <p style={styles.subtitle}>실시간 대학생 중고거래 및 물물교환 등록 현황</p>
        </div>

        <div style={styles.controls}>
          {/* Search */}
          <div style={styles.searchWrapper}>
            <Search size={16} color="var(--text-secondary)" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="물품명, 판매자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* College Filter */}
          <select
            value={selectedUniFilter}
            onChange={(e) => setSelectedUniFilter(e.target.value)}
            style={styles.uniSelect}
          >
            <option value="all">전체 대학</option>
            {UNIVERSITIES.map(uni => (
              <option key={uni.id} value={uni.name}>{uni.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={styles.filterTabs}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              ...styles.filterTab,
              backgroundColor: activeCategory === cat.id ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.04)',
              color: activeCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
              borderColor: activeCategory === cat.id ? 'rgba(255,0,122,0.4)' : 'var(--border-color)'
            }}
          >
            <span style={{ marginRight: 6 }}>{getCategoryEmoji(cat.id)}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Listings Table in Uniswap Token list style */}
      <div style={styles.tableCard} className="glass-card">
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={{ ...styles.th, width: '60px' }}>#</th>
                <th style={styles.th}>물품명</th>
                <th style={styles.th}>추정 가치</th>
                <th style={styles.th}>희망 교환 물품</th>
                <th style={styles.th}>소속 대학</th>
                <th style={styles.th}>상태</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length > 0 ? (
                filteredListings.map((item, index) => {
                  const isExpanded = expandedItemId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr 
                        style={{
                          ...styles.tr,
                          backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                        }}
                      >
                        <td style={styles.tdIndex}>{index + 1}</td>
                        <td style={styles.tdNameCell}>
                          <div style={styles.nameSection}>
                            <span style={styles.itemEmoji}>{getCategoryEmoji(item.category)}</span>
                            <div>
                              <div style={styles.itemName}>{item.name}</div>
                              <div style={styles.itemOwner}>
                                <User size={10} style={{ marginRight: 3 }} /> {item.owner}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.tdValue}>
                          <span style={styles.valueText}>{item.value} UC</span>
                          <span style={styles.valueWon}>~ ₩{(item.value * 1000).toLocaleString()}</span>
                        </td>
                        <td style={styles.tdPref}>{item.preferredTrade}</td>
                        <td style={styles.tdCollege}>
                          <span 
                            style={{ 
                              ...styles.collegeTag, 
                              backgroundColor: `${getUniColor(item.college)}18`,
                              color: getUniColor(item.college),
                              border: `1px solid ${getUniColor(item.college)}33`
                            }}
                          >
                            {item.college}
                          </span>
                        </td>
                        <td style={styles.tdStatus}>
                          <span 
                            style={{ 
                              ...styles.statusDot, 
                              backgroundColor: item.status === 'AVAILABLE' ? '#4caf50' : '#888888' 
                            }}
                          />
                          <span style={styles.statusText}>
                            {item.status === 'AVAILABLE' ? '거래가능' : '완료됨'}
                          </span>
                        </td>
                        <td style={styles.tdActions}>
                          <div style={styles.actionsContainer}>
                            <button 
                              style={styles.detailBtn}
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              title="상세보기"
                            >
                              <Eye size={15} color="var(--text-secondary)" />
                            </button>
                            <button
                              onClick={() => onSelectSwapItem(item)}
                              style={{
                                ...styles.swapBtn,
                                opacity: item.status === 'AVAILABLE' ? 1 : 0.4
                              }}
                              disabled={item.status !== 'AVAILABLE'}
                              className="btn btn-primary"
                            >
                              교환 제안
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded description detail row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} style={styles.expandedTd}>
                            <div style={styles.expandedContent} className="fade-in">
                              <div style={styles.expandedBox}>
                                <div style={styles.detailsHeader}>
                                  <Sparkles size={14} color="var(--primary-color)" />
                                  <span>상세 정보 및 설명</span>
                                </div>
                                <p style={styles.expandedDesc}>{item.description}</p>
                                <div style={styles.detailsMeta}>
                                  <span>등록일: {item.createdAt}</span>
                                  <span>•</span>
                                  <span>희망거래방식: 직거래/배송 조율 가능</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={styles.noData}>
                    검색 결과에 맞는 매물이 없습니다. 다른 검색어를 입력해보세요!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1100px',
    margin: '30px auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  statsStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px'
  },
  statCard: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px'
  },
  statTrend: {
    fontSize: '12px',
    color: '#4caf50',
    fontWeight: '600'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '10px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'var(--font-display)'
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginTop: '4px'
  },
  controls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '8px 14px',
    width: '240px',
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
  uniSelect: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    color: '#ffffff',
    padding: '8px 14px',
    fontSize: '13.5px',
    outline: 'none',
    cursor: 'pointer'
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  filterTab: {
    border: '1px solid',
    borderRadius: '14px',
    padding: '8px 16px',
    fontSize: '13.5px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  tableCard: {
    overflow: 'hidden',
    borderRadius: '24px'
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  thRow: {
    borderBottom: '1px solid var(--border-color)'
  },
  th: {
    padding: '16px 20px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.015)'
    }
  },
  tdIndex: {
    padding: '16px 20px',
    fontSize: '14px',
    color: 'var(--text-muted)',
    fontWeight: '500'
  },
  tdNameCell: {
    padding: '16px 20px'
  },
  nameSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  itemEmoji: {
    fontSize: '24px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff'
  },
  itemOwner: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '3px'
  },
  tdValue: {
    padding: '16px 20px'
  },
  valueText: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff'
  },
  valueWon: {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  tdPref: {
    padding: '16px 20px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  },
  tdCollege: {
    padding: '16px 20px'
  },
  collegeTag: {
    fontSize: '12px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '8px'
  },
  tdStatus: {
    padding: '16px 20px',
    whiteSpace: 'nowrap'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '6px',
    verticalAlign: 'middle'
  },
  statusText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    verticalAlign: 'middle'
  },
  tdActions: {
    padding: '16px 20px',
    textAlign: 'right'
  },
  actionsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px'
  },
  detailBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  },
  swapBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    borderRadius: '10px',
    boxShadow: 'none'
  },
  expandedTd: {
    padding: '0 20px 16px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)'
  },
  expandedContent: {
    padding: '12px 0'
  },
  expandedBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '16px'
  },
  detailsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--primary-color)',
    marginBottom: '8px',
    textTransform: 'uppercase'
  },
  expandedDesc: {
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    whiteSpace: 'pre-line'
  },
  detailsMeta: {
    display: 'flex',
    gap: '8px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '12px'
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '14px'
  }
};
