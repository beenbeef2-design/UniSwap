import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SwapCard from './components/SwapCard';
import ExploreListings from './components/ExploreListings';
import ResourcePools from './components/ResourcePools';
import MyPage from './components/MyPage';
import ConnectModal from './components/ConnectModal';
import { INITIAL_LISTINGS, INITIAL_POOLS } from './utils/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('swap');
  const [account, setAccount] = useState(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  
  // App data registries
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [pools, setPools] = useState(INITIAL_POOLS);
  
  // Pre-fill cache for explore -> swap transition
  const [preFilledReceiveItem, setPreFilledReceiveItem] = useState(null);

  // Authentication Handlers
  const handleConnect = (accountData) => {
    setAccount(accountData);
  };

  const handleDisconnect = () => {
    setAccount(null);
    setActiveTab('swap');
  };

  // Inventory & Marketplace Handlers
  const handleRegisterItem = (newItem) => {
    setAccount(prev => ({
      ...prev,
      inventory: [...prev.inventory, newItem]
    }));
  };

  const handlePublishToMarketplace = (itemId, newMarketItem, newTx) => {
    setAccount(prev => ({
      ...prev,
      inventory: prev.inventory.filter(item => item.id !== itemId),
      history: [newTx, ...prev.history]
    }));
    setListings(prev => [newMarketItem, ...prev]);
  };

  // Swap Core Logic
  const handlePerformSwap = (payType, payItem, payValue, receiveItem, receiveValue, newTx) => {
    setAccount(prev => {
      let updatedCredits = prev.credits;
      let updatedInventory = [...prev.inventory];

      // 1. Process Pay Side
      if (payType === 'credits') {
        updatedCredits -= payValue;
      } else if (payItem) {
        updatedInventory = updatedInventory.filter(item => item.id !== payItem.id);
      }

      // 2. Process Receive Side
      if (receiveItem) {
        // Add received item to user inventory
        const newInventoryItem = {
          id: `acquired-${Date.now()}`,
          name: receiveItem.name,
          category: receiveItem.category,
          value: receiveItem.value
        };
        updatedInventory.push(newInventoryItem);
      } else {
        // If received credits
        updatedCredits += receiveValue;
      }

      return {
        ...prev,
        credits: updatedCredits,
        inventory: updatedInventory,
        history: [newTx, ...prev.history]
      };
    });

    // 3. Mark the marketplace item as swapped (unavailable)
    if (receiveItem) {
      setListings(prev => prev.map(item => 
        item.id === receiveItem.id ? { ...item, status: 'SWAPPED' } : item
      ));
    }
  };

  // Pool Handlers
  const handleDepositToPool = (poolId, itemToDeposit, updatedPoolItem, newTx) => {
    // 1. Remove from user inventory & Add receipt history
    setAccount(prev => ({
      ...prev,
      inventory: prev.inventory.filter(item => item.id !== itemToDeposit.id),
      history: [newTx, ...prev.history]
    }));

    // 2. Add to pool registry
    setPools(prev => prev.map(pool => {
      if (pool.id === poolId) {
        return {
          ...pool,
          tvl: pool.tvl + 1,
          items: [...pool.items, updatedPoolItem]
        };
      }
      return pool;
    }));
  };

  const handleBorrowFromPool = (poolId, itemToBorrow, borrowFee, borrowedItemToInventory, newTx) => {
    // 1. Deduct fee & Add borrowed item to user inventory & Add history
    setAccount(prev => ({
      ...prev,
      credits: prev.credits - borrowFee,
      inventory: [...prev.inventory, borrowedItemToInventory],
      history: [newTx, ...prev.history]
    }));

    // 2. Remove item from pool registry
    setPools(prev => prev.map(pool => {
      if (pool.id === poolId) {
        return {
          ...pool,
          items: pool.items.filter(item => item.id !== itemToBorrow.id)
        };
      }
      return pool;
    }));
  };

  // Explore redirect to Swap
  const handleSelectSwapItem = (item) => {
    setPreFilledReceiveItem(item);
    setActiveTab('swap');
  };

  return (
    <div className="app-container">
      {/* Background glow blobs */}
      <div className="glow-blob glow-blob-pink"></div>
      <div className="glow-blob glow-blob-purple"></div>

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        account={account}
        onDisconnect={handleDisconnect}
        onConnectClick={() => setIsConnectModalOpen(true)}
      />

      {/* Main Tab Routing */}
      <main style={styles.mainContent}>
        {activeTab === 'swap' && (
          <SwapCard
            account={account}
            listings={listings}
            onConnectClick={() => setIsConnectModalOpen(true)}
            onPerformSwap={handlePerformSwap}
            preFilledReceiveItem={preFilledReceiveItem}
            clearPreFilledItem={() => setPreFilledReceiveItem(null)}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreListings
            listings={listings}
            onSelectSwapItem={handleSelectSwapItem}
            account={account}
          />
        )}

        {activeTab === 'pools' && (
          <ResourcePools
            pools={pools}
            account={account}
            onDepositToPool={handleDepositToPool}
            onBorrowFromPool={handleBorrowFromPool}
            onConnectClick={() => setIsConnectModalOpen(true)}
          />
        )}

        {activeTab === 'mypage' && (
          <MyPage
            account={account}
            onRegisterItem={handleRegisterItem}
            onPublishToMarketplace={handlePublishToMarketplace}
            onConnectClick={() => setIsConnectModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerDivider}></div>
        <div style={styles.footerText}>
          <span>UniSwap Protocol v1.0.0</span>
          <span>•</span>
          <span>대학생을 위한 안전한 탈중앙화 자원 공유 커뮤니티</span>
          <span>•</span>
          <a href="#" style={styles.footerLink}>스마트 계약 검증서</a>
        </div>
      </footer>

      {/* Global Connection Modal */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnect}
      />
    </div>
  );
}

const styles = {
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: '60px'
  },
  footer: {
    padding: '24px 20px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '12px'
  },
  footerDivider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    maxWidth: '1100px',
    margin: '0 auto 16px auto'
  },
  footerText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  footerLink: {
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: '600',
    ':hover': {
      textDecoration: 'underline'
    }
  }
};
