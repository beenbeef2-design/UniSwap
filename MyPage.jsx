import React, { useState } from 'react';
import { Plus, ShieldAlert, History, Coins, Tag, ListPlus, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../utils/mockData';

export default function MyPage({ account, onRegisterItem, onPublishToMarketplace, onConnectClick }) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('books');
  const [value, setValue] = useState(20);
  const [preferredTrade, setPreferredTrade] = useState('UniCredits');
  const [description, setDescription] = useState('');
  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);

  if (!account) {
    return (
      <div style={styles.notConnected} className="fade-in">
        <div style={styles.notConnectedCard} className="glass-card">
          <ShieldAlert size={48} color="var(--primary-color)" />
          <h3>대학 계정이 연동되지 않았습니다</h3>
          <p>
            내 인벤토리 확인, 물품 등록, 거래 내역 조회를 하려면 <br/>
            학교 인증 메일 연동이 필요합니다.
          </p>
          <button onClick={onConnectClick} className="btn btn-primary" style={styles.connectBtn}>
            대학 계정 연동하기
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName) return;

    const newItem = {
      id: `user-item-${Date.now()}`,
      name: itemName,
      category,
      value: parseInt(value) || 10,
      preferredTrade,
      description
    };

    onRegisterItem(newItem);
    
    // Reset form
    setItemName('');
    setCategory('books');
    setValue(20);
    setPreferredTrade('UniCredits');
    setDescription('');

    setIsRegisteredSuccess(true);
    setTimeout(() => setIsRegisteredSuccess(false), 3000);
  };

  const handlePublish = (item) => {
    const newMarketItem = {
      id: `item-${Date.now()}`,
      name: item.name,
      category: item.category,
      college: account.college,
      owner: account.username,
      value: item.value,
      preferredTrade: item.preferredTrade || 'UniCredits',
      description: item.description || '학생이 보관함에서 직접 등록한 양호한 상태의 물품입니다.',
      status: 'AVAILABLE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const newTx = {
      id: `tx-${Date.now()}`,
      type: 'MARKET_PUBLISH',
      detail: `${item.name} 시장 등록`,
      counterparty: 'Explore Marketplace',
      amount: 'Publish',
      date: new Date().toISOString().split('T')[0],
      status: 'SUCCESS'
    };

    onPublishToMarketplace(item.id, newMarketItem, newTx);
  };

  const getTxColor = (type) => {
    switch (type) {
      case 'SWAP_IN_CREDIT': 
      case 'POOL_BORROW':
        return '#ff4d4f'; // negative flow
      case 'CREDIT_EARN': 
        return '#4caf50'; // positive flow
      case 'POOL_DEPOSIT':
        return '#00f2fe';
      default:
        return '#98a1c0';
    }
  };

  const getTxText = (type) => {
    switch(type) {
      case 'SWAP_IN_CREDIT': return '포인트 구매';
      case 'SWAP_BARTER': return '물물교환';
      case 'POOL_DEPOSIT': return '풀 예치';
      case 'POOL_BORROW': return '풀 대여';
      case 'CREDIT_EARN': return '이자 수익';
      case 'MARKET_PUBLISH': return '마켓 등록';
      default: return '일반 거래';
    }
  };

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.leftCol}>
        {/* Profile Card */}
        <div style={styles.profileCard} className="glass-card">
          <div style={styles.profileHeader}>
            <div style={styles.avatar}>
              {account.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={styles.profileName}>{account.username}</h3>
              <p style={styles.profileMail}>{account.email}</p>
            </div>
          </div>
          <div style={styles.profileStats}>
            <div style={styles.profileStat}>
              <span style={styles.statLabel}>보유 대학 포인트</span>
              <span style={styles.statValCoins}>
                <Coins size={16} color="var(--primary-color)" />
                {account.credits} UC
              </span>
            </div>
            <div style={styles.profileStat}>
              <span style={styles.statLabel}>보관함 물품 수</span>
              <span style={styles.statVal}>{account.inventory.length}개</span>
            </div>
          </div>
        </div>

        {/* Register New Item Form */}
        <div style={styles.formCard} className="glass-card">
          <h3 style={styles.cardTitle}>
            <ListPlus size={18} color="var(--primary-color)" />
            새 물품 보관함 등록
          </h3>
          <p style={styles.cardSub}>내가 가진 물품을 인벤토리에 추가하고, 이후 교환하거나 대여 풀에 올릴 수 있습니다.</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>물품 이름</label>
              <input
                type="text"
                placeholder="예: Calculus 전공책, 아이패드 파우치"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formRow}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.select}
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>추정 가치 (UC 단위)</label>
                <input
                  type="number"
                  min="1"
                  value={value}
                  onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>희망 교환 상대 물품</label>
              <input
                type="text"
                placeholder="예: UniCredits, C언어 전공책 등"
                value={preferredTrade}
                onChange={(e) => setPreferredTrade(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>설명</label>
              <textarea
                placeholder="물품의 상태, 거래 희망 장소 등 상세 정보를 입력해주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
              />
            </div>

            {isRegisteredSuccess && (
              <div style={styles.successMessage}>
                <CheckCircle2 size={16} color="#4caf50" />
                <span>보관함에 성공적으로 등록되었습니다!</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
              <Plus size={16} />
              보관함 등록하기
            </button>
          </form>
        </div>
      </div>

      <div style={styles.rightCol}>
        {/* Inventory List */}
        <div style={styles.inventoryCard} className="glass-card">
          <h3 style={styles.cardTitle}>내 보관함 목록 ({account.inventory.length})</h3>
          <p style={styles.cardSub}>보관함 물품을 시장(Explore)에 올려 다른 학생들이 교환 제안을 할 수 있도록 해보세요.</p>
          
          <div style={styles.inventoryList}>
            {account.inventory.length > 0 ? (
              account.inventory.map((item) => (
                <div key={item.id} style={styles.inventoryRow}>
                  <div>
                    <span style={styles.invName}>{item.name}</span>
                    <div style={styles.invSub}>
                      <span>{item.category === 'books' ? '📚 전공서적' : item.category === 'electronics' ? '💻 전자기기' : '📦 기타'}</span>
                      <span>•</span>
                      <span>가치: {item.value} UC</span>
                    </div>
                  </div>
                  
                  {/* Action: Publish to explore marketplace if not borrowed item */}
                  {!item.name.startsWith('[대여중]') ? (
                    <button 
                      style={styles.publishBtn} 
                      className="btn btn-secondary"
                      onClick={() => handlePublish(item)}
                    >
                      마켓 등록
                    </button>
                  ) : (
                    <span style={styles.borrowStatusBadge}>대여중</span>
                  )}
                </div>
              ))
            ) : (
              <div style={styles.emptyInventory}>
                <p>보관함이 비어있습니다.</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>상단 양식을 통해 거래할 물품을 등록해주세요!</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History in block-explorer style */}
        <div style={styles.historyCard} className="glass-card">
          <h3 style={styles.cardTitle}>
            <History size={18} color="var(--primary-color)" />
            내 거래 트랜잭션 내역
          </h3>
          <p style={styles.cardSub}>학생 인증 계약 주소로 기록된 실시간 온체인 중고거래 영수증 내역입니다.</p>

          <div style={styles.historyList}>
            {account.history && account.history.length > 0 ? (
              account.history.map((tx) => (
                <div key={tx.id} style={styles.historyRow}>
                  <div style={styles.historyRowLeft}>
                    <span 
                      style={{ 
                        ...styles.txTypeBadge, 
                        color: getTxColor(tx.type),
                        borderColor: `${getTxColor(tx.type)}44`,
                        backgroundColor: `${getTxColor(tx.type)}10`
                      }}
                    >
                      {getTxText(tx.type)}
                    </span>
                    <div>
                      <div style={styles.txDetail}>{tx.detail}</div>
                      <div style={styles.txMeta}>
                        <span>상대: {tx.counterparty}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>
                  <div style={styles.historyRowRight}>
                    {tx.amount && (
                      <span style={{ 
                        ...styles.txAmount,
                        color: tx.amount.startsWith('-') ? '#ff4d4f' : '#4caf50' 
                      }}>
                        {tx.amount}
                      </span>
                    )}
                    <span style={styles.txHash}>
                      0x{tx.id.replace('tx-', '').slice(0, 6)}...
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyInventory}>
                <p>기록된 거래 트랜잭션이 아직 없습니다.</p>
              </div>
            )}
          </div>
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
    gap: '24px',
    flexWrap: 'wrap'
  },
  leftCol: {
    flex: 1,
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  rightCol: {
    flex: 1.3,
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  notConnected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: 20
  },
  notConnectedCard: {
    maxWidth: '440px',
    padding: '40px 30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  connectBtn: {
    padding: '12px 24px',
    marginTop: '12px'
  },
  profileCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatar: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    background: 'var(--primary-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
    boxShadow: '0 4px 15px rgba(255,0,122,0.3)'
  },
  profileName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff'
  },
  profileMail: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '2px'
  },
  profileStats: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '16px'
  },
  profileStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '600'
  },
  statVal: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff'
  },
  statValCoins: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  formCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  cardSub: {
    fontSize: '12.5px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  formRow: {
    display: 'flex',
    gap: '12px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  input: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    color: '#ffffff',
    padding: '11px 14px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    ':focus': {
      borderColor: 'var(--primary-color)'
    }
  },
  select: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    color: '#ffffff',
    padding: '11px 14px',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  },
  textarea: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    color: '#ffffff',
    padding: '11px 14px',
    fontSize: '14px',
    outline: 'none',
    minHeight: '80px',
    resize: 'vertical',
    transition: 'border-color 0.2s',
    ':focus': {
      borderColor: 'var(--primary-color)'
    }
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    border: '1px solid rgba(76, 175, 80, 0.2)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#4caf50',
    fontSize: '13px'
  },
  submitBtn: {
    padding: '12px',
    fontSize: '14px',
    marginTop: '6px'
  },
  inventoryCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inventoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  inventoryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderColor: 'rgba(255,255,255,0.12)'
    }
  },
  invName: {
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#ffffff'
  },
  invSub: {
    display: 'flex',
    gap: '8px',
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    marginTop: '4px'
  },
  publishBtn: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '10px',
    boxShadow: 'none'
  },
  borrowStatusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#ffc107',
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
    border: '1px solid rgba(255, 193, 7, 0.2)',
    padding: '4px 10px',
    borderRadius: '8px'
  },
  emptyInventory: {
    padding: '40px 10px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13.5px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  historyCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '320px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  historyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    backgroundColor: 'rgba(0,0,0,0.15)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px'
  },
  historyRowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  txTypeBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 8px',
    borderRadius: '8px',
    border: '1px solid',
    whiteSpace: 'nowrap'
  },
  txDetail: {
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#ffffff'
  },
  txMeta: {
    display: 'flex',
    gap: '8px',
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    marginTop: '3px'
  },
  historyRowRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  txAmount: {
    fontSize: '13px',
    fontWeight: '700'
  },
  txHash: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: 'var(--text-muted)'
  }
};
