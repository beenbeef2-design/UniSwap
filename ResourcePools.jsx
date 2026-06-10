import React, { useState } from 'react';
import { Plus, Percent, Coins, Lock, Check, BookOpen, Film, Wrench } from 'lucide-react';

export default function ResourcePools({ 
  pools, 
  account, 
  onDepositToPool, 
  onBorrowFromPool,
  onConnectClick 
}) {
  const [selectedPool, setSelectedPool] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'my-positions'
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [depositItem, setDepositItem] = useState(null);
  const [borrowItem, setBorrowItem] = useState(null);

  const getPoolIcon = (cat) => {
    switch (cat) {
      case 'books': return <BookOpen size={20} color="#ff007a" />;
      case 'electronics': return <Film size={20} color="#9c27b0" />;
      default: return <Wrench size={20} color="#00f2fe" />;
    }
  };

  const handleOpenDeposit = (pool) => {
    if (!account) {
      onConnectClick();
      return;
    }
    setSelectedPool(pool);
    setIsDepositModalOpen(true);
    setDepositItem(null);
  };

  const handleOpenBorrow = (pool) => {
    if (!account) {
      onConnectClick();
      return;
    }
    setSelectedPool(pool);
    setIsBorrowModalOpen(true);
    setBorrowItem(null);
  };

  const executeDeposit = () => {
    if (!depositItem) return;
    
    // Simulate deposit
    const updatedPoolItem = {
      id: `pool-item-${Date.now()}`,
      name: depositItem.name,
      owner: account.username,
      depositTime: new Date().toISOString().split('T')[0]
    };

    const newTx = {
      id: `tx-${Date.now()}`,
      type: 'POOL_DEPOSIT',
      detail: `${depositItem.name}을(를) [${selectedPool.name}]에 예치`,
      counterparty: selectedPool.name,
      amount: 'Deposit',
      date: new Date().toISOString().split('T')[0],
      status: 'SUCCESS'
    };

    onDepositToPool(selectedPool.id, depositItem, updatedPoolItem, newTx);
    setIsDepositModalOpen(false);
    setDepositItem(null);
  };

  const executeBorrow = () => {
    if (!borrowItem) return;
    
    const borrowFee = 15; // flat fee in UC
    if (account.credits < borrowFee) {
      alert('포인트가 부족합니다!');
      return;
    }

    const newTx = {
      id: `tx-${Date.now()}`,
      type: 'POOL_BORROW',
      detail: `[${selectedPool.name}]에서 ${borrowItem.name} 대여`,
      counterparty: selectedPool.name,
      amount: `-${borrowFee} UC`,
      date: new Date().toISOString().split('T')[0],
      status: 'SUCCESS'
    };

    const borrowedItemToInventory = {
      id: `borrowed-${Date.now()}`,
      name: `[대여중] ${borrowItem.name}`,
      category: selectedPool.category,
      value: 0 // borrowed items have no trade value
    };

    onBorrowFromPool(selectedPool.id, borrowItem, borrowFee, borrowedItemToInventory, newTx);
    setIsBorrowModalOpen(false);
    setBorrowItem(null);
  };

  // Find user positions in pools (mock matching owner name)
  const myDepositedItemsCount = account ? pools.reduce((acc, pool) => {
    const userDeposits = pool.items.filter(item => item.owner === account.username);
    return acc + userDeposits.length;
  }, 0) : 0;

  return (
    <div style={styles.container} className="fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>공동 자원 대여 풀 (Pools)</h2>
          <p style={styles.subtitle}>
            가끔 쓰는 고가 장비나 전공 서적을 풀에 기부하고, <br/>
            다른 학생들의 대여 거래 수수료를 통해 UniCredits를 획득해 보세요.
          </p>
        </div>

        <button 
          style={styles.newPosBtn} 
          className="btn btn-primary"
          onClick={() => {
            if (pools.length > 0) handleOpenDeposit(pools[0]);
          }}
        >
          <Plus size={16} />
          <span>새 포지션 추가 (+ LPs)</span>
        </button>
      </div>

      {/* Pools Tabs */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              ...styles.tab,
              color: activeTab === 'all' ? '#ffffff' : 'var(--text-secondary)',
              borderBottom: activeTab === 'all' ? '2px solid var(--primary-color)' : 'none'
            }}
          >
            전체 대여 풀
          </button>
          <button
            onClick={() => {
              if (!account) {
                onConnectClick();
                return;
              }
              setActiveTab('my-positions');
            }}
            style={{
              ...styles.tab,
              color: activeTab === 'my-positions' ? '#ffffff' : 'var(--text-secondary)',
              borderBottom: activeTab === 'my-positions' ? '2px solid var(--primary-color)' : 'none'
            }}
          >
            내 예치 현황 ({myDepositedItemsCount})
          </button>
        </div>
      </div>

      {activeTab === 'all' ? (
        <div style={styles.poolGrid}>
          {pools.map((pool) => (
            <div key={pool.id} style={styles.poolCard} className="glass-card">
              <div style={styles.poolHeader}>
                <div style={styles.poolIconWrapper}>
                  {getPoolIcon(pool.category)}
                </div>
                <div style={styles.poolHeaderInfo}>
                  <h3 style={styles.poolName}>{pool.name}</h3>
                  <span style={styles.poolCatText}>{pool.category === 'books' ? '도서/전공' : pool.category === 'electronics' ? 'IT/장비' : '생활/자재'}</span>
                </div>
              </div>

              <p style={styles.poolDesc}>{pool.description}</p>

              <div style={styles.poolStats}>
                <div style={styles.poolStatItem}>
                  <span style={styles.statLabel}>예치 APY (연 수익률)</span>
                  <span style={styles.statValApy}>
                    <Percent size={14} style={{ marginRight: 2 }} />
                    {pool.apy}%
                  </span>
                </div>
                <div style={styles.poolStatItem}>
                  <span style={styles.statLabel}>총 예치 물품 (TVL)</span>
                  <span style={styles.statVal}>{pool.items.length}개</span>
                </div>
                <div style={styles.poolStatItem}>
                  <span style={styles.statLabel}>누적 대여 횟수</span>
                  <span style={styles.statVal}>{pool.volume}회</span>
                </div>
              </div>

              {/* Collapsible item list inside pool */}
              <div style={styles.poolItemsBox}>
                <h4 style={styles.poolItemsTitle}>대여 가능한 목록 ({pool.items.length})</h4>
                <div style={styles.poolItemsScroll}>
                  {pool.items.length > 0 ? (
                    pool.items.map((item) => (
                      <div key={item.id} style={styles.poolItemRow}>
                        <span style={styles.poolItemName}>{item.name}</span>
                        <span style={styles.poolItemOwner}>제공: {item.owner}</span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyItemsText}>예치된 물품이 없습니다. 첫 예치자가 되어보세요!</div>
                  )}
                </div>
              </div>

              <div style={styles.poolActions}>
                <button 
                  style={styles.poolSecondaryBtn} 
                  className="btn btn-secondary"
                  onClick={() => handleOpenBorrow(pool)}
                >
                  <Coins size={14} />
                  대여하기 (15 UC)
                </button>
                <button 
                  style={styles.poolPrimaryBtn} 
                  className="btn btn-primary"
                  onClick={() => handleOpenDeposit(pool)}
                >
                  <Plus size={14} />
                  물품 예치 (LP)
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.myPositions}>
          {myDepositedItemsCount > 0 ? (
            pools.map(pool => {
              const myDeposits = pool.items.filter(item => item.owner === account?.username);
              if (myDeposits.length === 0) return null;
              return (
                <div key={pool.id} style={styles.positionCard} className="glass-card">
                  <div style={styles.positionHeader}>
                    <h4>{pool.name}</h4>
                    <span style={styles.posApy}>적립 수익률: {pool.apy}% APY</span>
                  </div>
                  <div style={styles.posList}>
                    {myDeposits.map(item => (
                      <div key={item.id} style={styles.posRow}>
                        <div>
                          <div style={styles.posName}>{item.name}</div>
                          <div style={styles.posDate}>예치일: {item.depositTime}</div>
                        </div>
                        <div style={styles.posReward}>
                          <Coins size={12} color="#4caf50" style={{ marginRight: 4 }} />
                          <span style={{ color: '#4caf50', fontWeight: 'bold' }}>실시간 적립 중 (+0.05 UC/시간)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.emptyMyPositions} className="glass-card">
              <Lock size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
              <p>현재 공동 대여 풀에 예치한 내 물품 포지션이 없습니다.</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                기부/예치하여 매시간 UniCredits 보상을 획득해 보세요!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Deposit item modal */}
      {isDepositModalOpen && selectedPool && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal} className="glass-card">
            <div style={styles.modalHeader}>
              <h3>물품 예치하기 (LPs 공급)</h3>
              <button style={styles.closeBtn} onClick={() => setIsDepositModalOpen(false)}>×</button>
            </div>
            <p style={styles.modalSub}>
              선택한 물품을 <strong>[{selectedPool.name}]</strong>에 예치합니다. <br/>
              예치 중에는 소유권이 유지되며, 대여가 일어날 때마다 포인트가 적립됩니다.
            </p>

            <div style={styles.modalBody}>
              <label style={styles.label}>예치할 내 물건 선택</label>
              <div style={styles.inventorySelectGrid}>
                {account.inventory.length > 0 ? (
                  account.inventory.map((item) => (
                    <button
                      key={item.id}
                      style={{
                        ...styles.inventoryOption,
                        borderColor: depositItem?.id === item.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
                        backgroundColor: depositItem?.id === item.id ? 'rgba(255,0,122,0.05)' : 'rgba(255,255,255,0.02)'
                      }}
                      onClick={() => setDepositItem(item)}
                    >
                      <span>{item.name}</span>
                      <span style={styles.inventoryOptionVal}>가치: {item.value} UC</span>
                    </button>
                  ))
                ) : (
                  <div style={styles.emptyText}>예치할 보관함 물품이 없습니다.</div>
                )}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setIsDepositModalOpen(false)}>취소</button>
              <button 
                style={styles.submitBtn} 
                className="btn btn-primary"
                onClick={executeDeposit}
                disabled={!depositItem}
              >
                예치 계약서 승인 및 예치
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Borrow item modal */}
      {isBorrowModalOpen && selectedPool && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal} className="glass-card">
            <div style={styles.modalHeader}>
              <h3>물품 대여하기 (LPs 차입)</h3>
              <button style={styles.closeBtn} onClick={() => setIsBorrowModalOpen(false)}>×</button>
            </div>
            <p style={styles.modalSub}>
              공동 풀에서 대여할 기기를 선택해주세요. 대여 시 <strong>15 UniCredits (UC)</strong>가 차감되며 기본 대여 기간은 7일입니다.
            </p>

            <div style={styles.modalBody}>
              <label style={styles.label}>대여할 물품 선택</label>
              <div style={styles.inventorySelectGrid}>
                {selectedPool.items.length > 0 ? (
                  selectedPool.items.map((item) => (
                    <button
                      key={item.id}
                      style={{
                        ...styles.inventoryOption,
                        borderColor: borrowItem?.id === item.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
                        backgroundColor: borrowItem?.id === item.id ? 'rgba(255,0,122,0.05)' : 'rgba(255,255,255,0.02)'
                      }}
                      onClick={() => setBorrowItem(item)}
                    >
                      <span>{item.name}</span>
                      <span style={styles.inventoryOptionVal}>제공자: {item.owner}</span>
                    </button>
                  ))
                ) : (
                  <div style={styles.emptyText}>대여 가능한 물품이 없습니다.</div>
                )}
              </div>
            </div>

            {account && account.credits < 15 && (
              <div style={styles.warningBox}>
                <span>보유 크레딧({account.credits} UC)이 대여 비용(15 UC)보다 부족합니다.</span>
              </div>
            )}

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setIsBorrowModalOpen(false)}>취소</button>
              <button 
                style={styles.submitBtn} 
                className="btn btn-primary"
                onClick={executeBorrow}
                disabled={!borrowItem || account.credits < 15}
              >
                15 UC 지불하고 대여하기
              </button>
            </div>
          </div>
        </div>
      )}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
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
    marginTop: '6px',
    lineHeight: '1.5'
  },
  newPosBtn: {
    padding: '12px 20px'
  },
  tabsContainer: {
    borderBottom: '1px solid var(--border-color)'
  },
  tabs: {
    display: 'flex',
    gap: '24px'
  },
  tab: {
    background: 'none',
    border: 'none',
    padding: '12px 4px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s'
  },
  poolGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    marginTop: '10px'
  },
  poolCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  poolHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  poolIconWrapper: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)'
  },
  poolHeaderInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  poolName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff'
  },
  poolCatText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  poolDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    minHeight: '40px'
  },
  poolStats: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid var(--border-color)'
  },
  poolStatItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statLabel: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
    fontWeight: '500'
  },
  statVal: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#ffffff'
  },
  statValApy: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#ff007a',
    display: 'flex',
    alignItems: 'center'
  },
  poolItemsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid rgba(255,255,255,0.02)'
  },
  poolItemsTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '8px'
  },
  poolItemsScroll: {
    maxHeight: '90px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  poolItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11.5px',
    color: 'var(--text-muted)'
  },
  poolItemName: {
    color: '#ffffff',
    fontWeight: '500'
  },
  poolItemOwner: {
    fontStyle: 'italic'
  },
  poolActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  poolSecondaryBtn: {
    flex: 1,
    padding: '10px',
    fontSize: '13.5px'
  },
  poolPrimaryBtn: {
    flex: 1,
    padding: '10px',
    fontSize: '13.5px'
  },
  myPositions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '10px'
  },
  positionCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  positionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px'
  },
  posApy: {
    fontSize: '13px',
    color: 'var(--primary-color)',
    fontWeight: '600'
  },
  posList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  posRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.04)'
  },
  posName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff'
  },
  posDate: {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  posReward: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12.5px'
  },
  emptyMyPositions: {
    padding: '48px 20px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '14.5px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20
  },
  modal: {
    width: '100%',
    maxWidth: '440px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  modalSub: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  inventorySelectGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '180px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  inventoryOption: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid',
    cursor: 'pointer',
    color: '#ffffff',
    textAlign: 'left',
    fontSize: '13.5px',
    fontWeight: '600',
    outline: 'none',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.06)'
    }
  },
  inventoryOptionVal: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  warningBox: {
    backgroundColor: 'rgba(255, 77, 79, 0.05)',
    border: '1px solid rgba(255, 77, 79, 0.15)',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#ff4d4f',
    fontSize: '12.5px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px'
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: '600'
  },
  submitBtn: {
    flex: 2,
    padding: '12px'
  },
  emptyText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '20px'
  },
  emptyItemsText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '10px 0'
  }
};
