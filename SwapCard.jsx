import React, { useState, useEffect } from 'react';
import { Settings, ArrowDown, HelpCircle, Check, Loader2, Info } from 'lucide-react';
import { CATEGORIES } from '../utils/mockData';

export default function SwapCard({
  account,
  listings,
  onConnectClick,
  onPerformSwap,
  preFilledReceiveItem,
  clearPreFilledItem
}) {
  // Swap states
  const [payType, setPayType] = useState('credits'); // 'credits' or 'item'
  const [payValue, setPayValue] = useState(0); // if credits
  const [payItem, setPayItem] = useState(null); // if item
  
  const [receiveType, setReceiveType] = useState('item'); // 'credits' or 'item'
  const [receiveValue, setReceiveValue] = useState(0); // if credits
  const [receiveItem, setReceiveItem] = useState(null); // if item

  // Dialog / Popover states
  const [isPaySelectorOpen, setIsPaySelectorOpen] = useState(false);
  const [isReceiveSelectorOpen, setIsReceiveSelectorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Settings values
  const [allowNegotiation, setAllowNegotiation] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState('direct'); // 'direct' or 'parcel' or 'both'
  
  // Tx confirmation state
  const [txState, setTxState] = useState('none'); // 'none', 'confirming', 'signing', 'success'
  
  // Selector search filters
  const [paySearch, setPaySearch] = useState('');
  const [receiveSearch, setReceiveSearch] = useState('');
  const [receiveFilter, setReceiveFilter] = useState('all');

  // Handle pre-filled item from explore tab
  useEffect(() => {
    if (preFilledReceiveItem) {
      setReceiveType('item');
      setReceiveItem(preFilledReceiveItem);
      setReceiveValue(preFilledReceiveItem.value);
      
      // Auto-set pay to credits with equal value as default proposal
      setPayType('credits');
      setPayValue(preFilledReceiveItem.value);
      setPayItem(null);
      
      clearPreFilledItem();
    }
  }, [preFilledReceiveItem]);

  // Flip pay & receive direction
  const handleFlip = () => {
    const tempPayType = payType;
    const tempPayValue = payValue;
    const tempPayItem = payItem;
    
    setPayType(receiveType);
    if (receiveType === 'credits') {
      setPayValue(receiveValue);
      setPayItem(null);
    } else {
      setPayItem(receiveItem);
      setPayValue(receiveItem ? receiveItem.value : 0);
    }
    
    setReceiveType(tempPayType);
    if (tempPayType === 'credits') {
      setReceiveValue(tempPayValue);
      setReceiveItem(null);
    } else {
      setReceiveItem(tempPayItem);
      setReceiveValue(tempPayItem ? tempPayItem.value : 0);
    }
    
    // Animate arrow rotation
    const arrow = document.getElementById('swap-arrow-icon');
    if (arrow) {
      arrow.classList.remove('rotate-once');
      void arrow.offsetWidth; // Trigger reflow
      arrow.classList.add('rotate-once');
    }
  };

  // Get active user inventory
  const userInventory = account ? account.inventory : [];

  // Filter lists
  const filteredPayItems = userInventory.filter(item => 
    item.name.toLowerCase().includes(paySearch.toLowerCase())
  );

  const filteredReceiveItems = listings.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(receiveSearch.toLowerCase()) || 
                          item.college.toLowerCase().includes(receiveSearch.toLowerCase());
    const matchesCategory = receiveFilter === 'all' || item.category === receiveFilter;
    const isAvailable = item.status === 'AVAILABLE';
    return matchesSearch && matchesCategory && isAvailable;
  });

  const handleSelectPayItem = (item) => {
    setPayType('item');
    setPayItem(item);
    setPayValue(item.value);
    setIsPaySelectorOpen(false);
  };

  const handleSelectPayCredits = () => {
    setPayType('credits');
    setPayItem(null);
    setPayValue(10); // default starting credits
    setIsPaySelectorOpen(false);
  };

  const handleSelectReceiveItem = (item) => {
    setReceiveType('item');
    setReceiveItem(item);
    setReceiveValue(item.value);
    
    // Auto populate default credit counter offer if credits pay is selected
    if (payType === 'credits') {
      setPayValue(item.value);
    }
    setIsReceiveSelectorOpen(false);
  };

  const handleSelectReceiveCredits = () => {
    setReceiveType('credits');
    setReceiveItem(null);
    setReceiveValue(payItem ? payItem.value : 10);
    setIsReceiveSelectorOpen(false);
  };

  // Check trade validity
  const isFormValid = () => {
    if (!account) return false;
    
    // Pay validation
    if (payType === 'credits') {
      if (payValue <= 0 || payValue > account.credits) return false;
    } else {
      if (!payItem) return false;
    }

    // Receive validation
    if (receiveType === 'credits') {
      if (receiveValue <= 0) return false;
    } else {
      if (!receiveItem) return false;
    }

    // Cannot swap credits for credits
    if (payType === 'credits' && receiveType === 'credits') return false;

    return true;
  };

  const getButtonText = () => {
    if (!account) return '대학 계정 연동하기';
    if (payType === 'credits' && payValue > account.credits) return '포인트 잔액이 부족합니다';
    if (!isFormValid()) return '물품 및 거래 조건 선택';
    return '스왑 제안 제출';
  };

  const handleAction = () => {
    if (!account) {
      onConnectClick();
      return;
    }
    if (isFormValid()) {
      setTxState('confirming');
    }
  };

  const executeTx = () => {
    setTxState('signing');
    setTimeout(() => {
      // Simulate signing and executing swap
      const newTx = {
        id: `tx-${Date.now()}`,
        type: payType === 'credits' ? 'SWAP_IN_CREDIT' : 'SWAP_BARTER',
        detail: payType === 'credits' 
          ? `${receiveItem.name} 대여/구매` 
          : `${payItem.name} ➔ ${receiveItem.name} 교환`,
        counterparty: receiveType === 'item' ? receiveItem.owner : 'Credits Pool',
        amount: payType === 'credits' ? `-${payValue} UC` : 'Barter',
        date: new Date().toISOString().split('T')[0],
        status: 'SUCCESS'
      };

      onPerformSwap(payType, payItem, payValue, receiveItem, receiveValue, newTx);
      setTxState('success');
    }, 2500);
  };

  const resetSwapForm = () => {
    setPayItem(null);
    setPayValue(0);
    setReceiveItem(null);
    setReceiveValue(0);
    setTxState('none');
  };

  return (
    <div style={styles.cardContainer}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>교환 (Swap)</span>
        <div style={styles.settingsWrapper}>
          <button style={styles.iconBtn} onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
            <Settings size={18} color={isSettingsOpen ? 'var(--primary-color)' : '#98a1c0'} />
          </button>
          
          {isSettingsOpen && (
            <div style={styles.settingsPopover} className="glass-card">
              <h4 style={styles.popTitle}>거래 설정</h4>
              <div style={styles.popItem}>
                <span>가격 절충(네고) 가능</span>
                <input
                  type="checkbox"
                  checked={allowNegotiation}
                  onChange={(e) => setAllowNegotiation(e.target.checked)}
                />
              </div>
              <div style={styles.popItem}>
                <span>희망 거래 방식</span>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  style={styles.select}
                >
                  <option value="direct">직거래</option>
                  <option value="parcel">택배거래</option>
                  <option value="both">둘다 가능</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pay input box */}
      <div style={styles.inputCard}>
        <div style={styles.inputHeader}>
          <span style={styles.label}>내가 줄 것 (Offer)</span>
          {account && (
            <span style={styles.balance}>
              잔액: {payType === 'credits' ? `${account.credits} UC` : `${userInventory.length}개`}
            </span>
          )}
        </div>
        <div style={styles.inputBody}>
          {payType === 'credits' ? (
            <input
              type="number"
              className="input-field"
              value={payValue || ''}
              onChange={(e) => setPayValue(parseInt(e.target.value) || 0)}
              placeholder="0"
              style={{ width: '60%' }}
              disabled={!account}
            />
          ) : (
            <div style={styles.selectedItemText}>
              {payItem ? payItem.name : '물품 선택'}
            </div>
          )}

          <button 
            style={{
              ...styles.tokenSelector,
              background: payItem || payType === 'credits' ? 'rgba(255, 255, 255, 0.08)' : 'var(--primary-gradient)'
            }}
            onClick={() => account && setIsPaySelectorOpen(true)}
            disabled={!account}
          >
            {payType === 'credits' ? (
              <>
                <div style={styles.tokenDotPink}>UC</div>
                <span>UniCredits</span>
              </>
            ) : payItem ? (
              <span>{payItem.name.slice(0, 10)}...</span>
            ) : (
              <span>내 물품 선택</span>
            )}
            <span style={styles.arrowDown}>▼</span>
          </button>
        </div>
        <div style={styles.inputFooter}>
          <span style={styles.estValue}>
            {payType === 'credits' ? `~ ₩${(payValue * 1000).toLocaleString()}` : payItem ? `가치: ~${payItem.value} UC` : ''}
          </span>
        </div>
      </div>

      {/* Flip Button */}
      <div style={styles.arrowContainer}>
        <button style={styles.arrowBtn} onClick={handleFlip}>
          <ArrowDown id="swap-arrow-icon" size={16} color="#ffffff" />
        </button>
      </div>

      {/* Receive input box */}
      <div style={styles.inputCard}>
        <div style={styles.inputHeader}>
          <span style={styles.label}>내가 받을 것 (Receive)</span>
        </div>
        <div style={styles.inputBody}>
          {receiveType === 'credits' ? (
            <input
              type="number"
              className="input-field"
              value={receiveValue || ''}
              onChange={(e) => setReceiveValue(parseInt(e.target.value) || 0)}
              placeholder="0"
              style={{ width: '60%' }}
              disabled={!account}
            />
          ) : (
            <div style={styles.selectedItemText}>
              {receiveItem ? receiveItem.name : '물품 선택'}
            </div>
          )}

          <button 
            style={{
              ...styles.tokenSelector,
              background: receiveItem || receiveType === 'credits' ? 'rgba(255, 255, 255, 0.08)' : 'var(--primary-gradient)'
            }}
            onClick={() => account && setIsReceiveSelectorOpen(true)}
            disabled={!account}
          >
            {receiveType === 'credits' ? (
              <>
                <div style={styles.tokenDotPink}>UC</div>
                <span>UniCredits</span>
              </>
            ) : receiveItem ? (
              <span>{receiveItem.name.slice(0, 10)}...</span>
            ) : (
              <span>캠퍼스 물품 선택</span>
            )}
            <span style={styles.arrowDown}>▼</span>
          </button>
        </div>
        <div style={styles.inputFooter}>
          <span style={styles.estValue}>
            {receiveType === 'credits' ? `~ ₩${(receiveValue * 1000).toLocaleString()}` : receiveItem ? `소속: ${receiveItem.college}` : ''}
          </span>
          {receiveItem && (
            <span style={styles.itemPref}>
              (희망: {receiveItem.preferredTrade})
            </span>
          )}
        </div>
      </div>

      {/* Trade info block */}
      {isFormValid() && (
        <div style={styles.infoBlock}>
          <div style={styles.infoRow}>
            <span>스왑 형태</span>
            <span>{payType === 'credits' ? '포인트 구매/대여' : '물물 교환 (Barter)'}</span>
          </div>
          <div style={styles.infoRow}>
            <span>예상 중개 수수료</span>
            <span style={{ color: '#00f2fe' }}>0 UC (무료)</span>
          </div>
          <div style={styles.infoRow}>
            <span>상대방 대학</span>
            <span>{receiveType === 'item' ? receiveItem.college : '자유 교환'}</span>
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={handleAction}
        className="btn btn-primary"
        style={styles.actionBtn}
        disabled={account && !isFormValid()}
      >
        {getButtonText()}
      </button>

      {/* Pay selector modal */}
      {isPaySelectorOpen && (
        <div style={styles.selectorOverlay}>
          <div style={styles.selectorModal} className="glass-card">
            <div style={styles.modalHeader}>
              <h4 style={styles.modalTitle}>제공할 물건 선택</h4>
              <button style={styles.closeBtn} onClick={() => setIsPaySelectorOpen(false)}>×</button>
            </div>
            
            <div style={styles.selectOption} onClick={handleSelectPayCredits}>
              <div style={styles.tokenDotPink}>UC</div>
              <div style={styles.selectOptionDetails}>
                <div style={styles.selectOptionName}>UniCredits 포인트</div>
                <div style={styles.selectOptionSub}>보유 잔액: {account.credits} UC</div>
              </div>
            </div>

            <div style={styles.selectorDivider}>내 보관함 물품</div>
            <input
              type="text"
              placeholder="내 물품 검색..."
              value={paySearch}
              onChange={(e) => setPaySearch(e.target.value)}
              style={styles.modalSearch}
            />

            <div style={styles.itemList}>
              {filteredPayItems.length > 0 ? (
                filteredPayItems.map((item) => (
                  <div key={item.id} style={styles.itemRow} onClick={() => handleSelectPayItem(item)}>
                    <div>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemDetails}>추정가치: {item.value} UC</div>
                    </div>
                    <span style={styles.categoryBadge}>{item.category}</span>
                  </div>
                ))
              ) : (
                <div style={styles.emptyText}>보관함에 보낼 수 있는 물품이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receive selector modal */}
      {isReceiveSelectorOpen && (
        <div style={styles.selectorOverlay}>
          <div style={styles.selectorModal} className="glass-card">
            <div style={styles.modalHeader}>
              <h4 style={styles.modalTitle}>받을 물품 선택</h4>
              <button style={styles.closeBtn} onClick={() => setIsReceiveSelectorOpen(false)}>×</button>
            </div>

            <input
              type="text"
              placeholder="물품명, 대학교명 검색..."
              value={receiveSearch}
              onChange={(e) => setReceiveSearch(e.target.value)}
              style={styles.modalSearch}
            />

            <div style={styles.modalFilters}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  style={{
                    ...styles.filterTab,
                    backgroundColor: receiveFilter === cat.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                    color: receiveFilter === cat.id ? '#ffffff' : 'var(--text-secondary)'
                  }}
                  onClick={() => setReceiveFilter(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div style={styles.itemList}>
              {filteredReceiveItems.length > 0 ? (
                filteredReceiveItems.map((item) => (
                  <div key={item.id} style={styles.itemRow} onClick={() => handleSelectReceiveItem(item)}>
                    <div>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemDetails}>
                        {item.college} | 가치: {item.value} UC
                      </div>
                    </div>
                    <span style={styles.categoryBadge}>{item.category}</span>
                  </div>
                ))
              ) : (
                <div style={styles.emptyText}>교환 가능한 캠퍼스 물품이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transaction flow overlay */}
      {txState !== 'none' && (
        <div style={styles.txOverlay}>
          <div style={styles.txModal} className="glass-card">
            {txState === 'confirming' && (
              <div style={styles.txConfirmBody}>
                <h3 style={styles.txTitle}>교환 제안 확인</h3>
                <p style={styles.txSub}>아래 계약 조건으로 거래 계약서 초안을 전송합니다.</p>
                
                <div style={styles.contractBox}>
                  <div style={styles.contractRow}>
                    <span style={styles.contractLabel}>소속인</span>
                    <span style={styles.contractVal}>{account.college} {account.username}</span>
                  </div>
                  <div style={styles.contractDivider} />
                  <div style={styles.contractRow}>
                    <span style={styles.contractLabel}>보내는 가치</span>
                    <span style={{ ...styles.contractVal, color: '#ff007a' }}>
                      {payType === 'credits' ? `${payValue} UniCredits` : payItem.name}
                    </span>
                  </div>
                  <div style={styles.contractRow}>
                    <span style={styles.contractLabel}>받는 가치</span>
                    <span style={{ ...styles.contractVal, color: '#4caf50' }}>
                      {receiveType === 'credits' ? `${receiveValue} UniCredits` : receiveItem.name}
                    </span>
                  </div>
                  <div style={styles.contractDivider} />
                  <div style={styles.contractRow}>
                    <span style={styles.contractLabel}>상대 거래자</span>
                    <span style={styles.contractVal}>
                      {receiveType === 'item' ? `${receiveItem.college} ${receiveItem.owner}` : '자유 교환'}
                    </span>
                  </div>
                </div>

                <div style={styles.txInfoRow}>
                  <Info size={14} color="#98a1c0" />
                  <span>제출 후 상대방이 수락하면 거래가 즉시 매칭됩니다.</span>
                </div>

                <div style={styles.txActionBtns}>
                  <button style={styles.txCancelBtn} onClick={() => setTxState('none')}>취소</button>
                  <button style={styles.txOkBtn} className="btn btn-primary" onClick={executeTx}>제안 제출하기</button>
                </div>
              </div>
            )}

            {txState === 'signing' && (
              <div style={styles.txSigningBody}>
                <Loader2 size={48} color="var(--primary-color)" className="rotate-once" style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} />
                <h3 style={styles.txTitle} style={{ marginTop: 20 }}>스마트 계약서 생성 중...</h3>
                <p style={styles.txSub}>대학 이메일 인증키({account.email})로 <br/> 디지털 서명 트랜잭션을 실행하고 있습니다.</p>
                <div style={styles.txSignVisual}>
                  <span style={styles.signPulse}></span>
                  <span>Signing SNU-CONTRACT-ID: {Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>
            )}

            {txState === 'success' && (
              <div style={styles.txSuccessBody}>
                <div style={styles.successCircle}>
                  <Check size={36} color="#ffffff" />
                </div>
                <h3 style={styles.txTitle} style={{ marginTop: 20 }}>거래 제안 등록 완료!</h3>
                <p style={styles.txSub}>대학생 직거래 매칭 스마트 계약이 체결 대기 상태로 <br/> Explore 탭에 성공적으로 등록되었습니다.</p>
                <button 
                  style={styles.txDoneBtn} 
                  className="btn btn-primary" 
                  onClick={resetSwapForm}
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  cardContainer: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    padding: '12px 16px 20px 16px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
    margin: '40px auto 0 auto',
    position: 'relative'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 8px 12px 8px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff'
  },
  settingsWrapper: {
    position: 'relative'
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    }
  },
  settingsPopover: {
    position: 'absolute',
    top: '32px',
    right: 0,
    width: '240px',
    padding: '16px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: 'var(--bg-panel)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px'
  },
  popTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '4px'
  },
  popItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  select: {
    backgroundColor: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '4px 8px',
    fontSize: '12.5px',
    outline: 'none'
  },
  inputCard: {
    backgroundColor: 'var(--bg-input)',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    transition: 'border-color 0.2s',
    ':focus-within': {
      borderColor: 'var(--border-focus)'
    }
  },
  inputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '8px'
  },
  label: {
    fontWeight: '500'
  },
  balance: {
    fontWeight: '500'
  },
  inputBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    minHeight: '42px'
  },
  selectedItemText: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    width: '60%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  tokenSelector: {
    border: 'none',
    borderRadius: '16px',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '15px',
    transition: 'all 0.2s',
    outline: 'none'
  },
  tokenDotPink: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrowDown: {
    fontSize: '9px',
    opacity: 0.8
  },
  inputFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12.5px',
    color: 'var(--text-muted)',
    marginTop: '10px'
  },
  estValue: {
    fontWeight: '500'
  },
  itemPref: {
    color: 'var(--text-secondary)',
    fontStyle: 'italic'
  },
  arrowContainer: {
    display: 'flex',
    justifyContent: 'center',
    height: '12px',
    position: 'relative',
    zIndex: 2,
    margin: '-4px 0'
  },
  arrowBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1b1e24',
    border: '4px solid var(--bg-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    transition: 'all 0.2s',
    ':hover': {
      transform: 'scale(1.08)',
      borderColor: '#242831'
    }
  },
  infoBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '12px 14px',
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  actionBtn: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '700',
    borderRadius: '16px',
    marginTop: '14px',
    boxShadow: '0 8px 25px rgba(255, 0, 122, 0.25)'
  },
  selectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 10, 14, 0.95)',
    zIndex: 10,
    borderRadius: '24px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column'
  },
  selectorModal: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'none',
    border: 'none',
    boxShadow: 'none'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  modalTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px'
  },
  selectOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  },
  selectOptionDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  selectOptionName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff'
  },
  selectOptionSub: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  selectorDivider: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    margin: '14px 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  modalSearch: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    color: '#ffffff',
    padding: '10px 14px',
    fontSize: '13.5px',
    outline: 'none',
    marginBottom: '10px'
  },
  modalFilters: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    paddingBottom: '8px',
    marginBottom: '10px'
  },
  filterTab: {
    border: 'none',
    borderRadius: '10px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  itemList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)'
    }
  },
  itemName: {
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#ffffff'
  },
  itemDetails: {
    fontSize: '11.5px',
    color: 'var(--text-secondary)',
    marginTop: '2px'
  },
  categoryBadge: {
    fontSize: '10px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: '2px 6px',
    borderRadius: '6px',
    color: 'var(--text-secondary)'
  },
  emptyText: {
    fontSize: '12.5px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginTop: '20px'
  },
  txOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20
  },
  txModal: {
    width: '100%',
    maxWidth: '400px',
    padding: '24px',
    textAlign: 'center',
    borderRadius: '24px'
  },
  txTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff'
  },
  txSub: {
    fontSize: '13.5px',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    lineHeight: '1.4'
  },
  contractBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '16px',
    margin: '20px 0',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  contractRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  },
  contractLabel: {
    color: 'var(--text-secondary)'
  },
  contractVal: {
    color: '#ffffff',
    fontWeight: '600'
  },
  contractDivider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '6px 0'
  },
  txInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  txActionBtns: {
    display: 'flex',
    gap: '12px'
  },
  txCancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: '600'
  },
  txOkBtn: {
    flex: 2,
    padding: '12px'
  },
  txSigningBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0'
  },
  txSignVisual: {
    marginTop: '24px',
    padding: '10px 16px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    fontSize: '11px',
    fontFamily: 'monospace',
    color: 'var(--text-muted)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  signPulse: {
    width: '6px',
    height: '6px',
    backgroundColor: '#00f2fe',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'pulse 1s infinite alternate'
  },
  txSuccessBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 0'
  },
  successCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#4caf50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 25px rgba(76, 175, 80, 0.4)',
    animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  txDoneBtn: {
    width: '100%',
    padding: '12px',
    marginTop: '24px'
  }
};
