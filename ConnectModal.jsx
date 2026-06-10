import React, { useState } from 'react';
import { X, Mail, ShieldCheck, School, ChevronRight } from 'lucide-react';
import { UNIVERSITIES, SAMPLE_ACCOUNTS } from '../utils/mockData';

export default function ConnectModal({ isOpen, onClose, onConnect }) {
  const [selectedUni, setSelectedUni] = useState(null);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1: Select Uni, 2: Enter Email & Code
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUniSelect = (uni) => {
    setSelectedUni(uni);
    setEmail('');
    setStep(2);
    setError('');
  };

  const handleBack = () => {
    setStep(1);
    setSelectedUni(null);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    // Validate email domain
    const emailDomain = email.split('@')[1];
    if (emailDomain !== selectedUni.domain) {
      setError(`${selectedUni.name} 이메일 형식(@${selectedUni.domain})에 맞지 않습니다.`);
      return;
    }

    // Perform mock connection
    const foundAccount = SAMPLE_ACCOUNTS[email] || {
      email: email,
      college: selectedUni.name,
      username: `${selectedUni.id}_student_${Math.floor(100 + Math.random() * 900)}`,
      credits: 100, // New user default credit
      inventory: [
        { id: `new-item-${Date.now()}-1`, name: '새내기 추천 도서', category: 'books', value: 15 },
        { id: `new-item-${Date.now()}-2`, name: '휴대용 텀블러 (미사용)', category: 'daily', value: 8 }
      ],
      history: []
    };

    onConnect(foundAccount);
    onClose();
    // Reset state
    setStep(1);
    setSelectedUni(null);
    setEmail('');
    setVerificationCode('');
  };

  return (
    <div style={styles.overlay} className="fade-in">
      <div style={styles.modal} className="glass-card">
        <div style={styles.header}>
          <h3 style={styles.title}>
            {step === 1 ? '대학 계정 연동' : `${selectedUni.name} 연동`}
          </h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} color="#98a1c0" />
          </button>
        </div>

        {step === 1 ? (
          <div style={styles.body}>
            <p style={styles.subtitle}>UniSwap을 이용하시려면 학교 이메일 인증이 필요합니다. 소속 대학을 선택해주세요.</p>
            <div style={styles.uniGrid}>
              {UNIVERSITIES.map((uni) => (
                <button
                  key={uni.id}
                  style={{
                    ...styles.uniCard,
                    borderColor: selectedUni?.id === uni.id ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.08)'
                  }}
                  onClick={() => handleUniSelect(uni)}
                >
                  <div style={styles.uniLeft}>
                    <div style={{ ...styles.uniLogoDot, backgroundColor: uni.color }}>
                      <School size={16} color="#ffffff" />
                    </div>
                    <span style={styles.uniName}>{uni.name}</span>
                  </div>
                  <ChevronRight size={18} color="#5d6785" />
                </button>
              ))}
            </div>
            <div style={styles.hintBox}>
              <ShieldCheck size={16} color="var(--primary-color)" />
              <span style={styles.hintText}>학생인증을 마쳐야 물품 거래 및 풀 대여를 이용할 수 있습니다.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.body}>
            <p style={styles.subtitle}>
              학생 이메일을 입력하시면 거래용 인벤토리와 크레딧이 동기화됩니다. <br/>
              (개발자 데모: <strong>test@kaist.ac.kr</strong> 이나 <strong>student@snu.ac.kr</strong>을 입력하면 기존 아이템 목록이 동기화됩니다.)
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>학교 이메일 주소</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#98a1c0" style={{ marginRight: 10 }} />
                <input
                  type="email"
                  placeholder={`student@${selectedUni.domain}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>인증 번호 (임의의 번호 입력 가능)</label>
              <div style={styles.inputWrapper}>
                <ShieldCheck size={18} color="#98a1c0" style={{ marginRight: 10 }} />
                <input
                  type="text"
                  placeholder="6자리 번호 입력"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.actionButtons}>
              <button type="button" style={styles.backBtn} onClick={handleBack}>
                이전으로
              </button>
              <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
                연동 완료
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20
  },
  modal: {
    width: '100%',
    maxWidth: '460px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'var(--font-display)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    }
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '8px'
  },
  uniGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '260px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  uniCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    outline: 'none',
    color: '#ffffff',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      transform: 'translateY(-1px)'
    }
  },
  uniLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  uniLogoDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  uniName: {
    fontSize: '15px',
    fontWeight: '600'
  },
  hintBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 0, 122, 0.05)',
    border: '1px solid rgba(255, 0, 122, 0.1)',
    borderRadius: '12px',
    padding: '12px 14px',
    marginTop: '8px'
  },
  hintText: {
    fontSize: '12.5px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '14px',
    padding: '12px 16px',
    transition: 'border-color 0.2s',
    ':focus-within': {
      borderColor: 'var(--primary-color)'
    }
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '15px'
  },
  error: {
    color: '#ff4d4f',
    fontSize: '13px',
    backgroundColor: 'rgba(255, 77, 79, 0.05)',
    border: '1px solid rgba(255, 77, 79, 0.15)',
    padding: '10px 12px',
    borderRadius: '10px',
    textAlign: 'center'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px'
  },
  backBtn: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-primary)',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  },
  submitBtn: {
    flex: 2,
    padding: '14px'
  }
};
