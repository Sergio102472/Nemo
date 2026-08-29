import { useState, useEffect, useMemo } from 'react'
import './App.css'

// Демо-кошельки и балансы (позже заменим на реальное подключение)
type Wallet = {
  id: string
  name: string
  address: string
  balances: Record<string, number>
}

const DEMO_WALLETS: Wallet[] = [
  {
    id: 'w1',
    name: 'MetaMask',
    address: '0x71C...9A3f',
    balances: { BTC: 0.12, ETH: 2.45, USDT: 1250, SOL: 45 },
  },
  {
    id: 'w2',
    name: 'Trust Wallet',
    address: '0x8B2...4c1D',
    balances: { ETH: 0.8, USDC: 500, BNB: 3.2 },
  },
]

// Курсы (демо; позже — CoinGecko / DEX)
const RATES: Record<string, number> = {
  BTC: 95000,
  ETH: 3200,
  USDT: 1,
  USDC: 1,
  SOL: 180,
  BNB: 580,
}

const ALL_COINS = Object.keys(RATES)

export default function App() {
  const [connectedWallets, setConnectedWallets] = useState<Wallet[]>([])
  const [fromCoin, setFromCoin] = useState('ETH')
  const [toCoin, setToCoin] = useState('USDT')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')

  // Список монет, которыми владеет пользователь (из подключённых кошельков)
  const availableCoins = useMemo(() => {
    if (connectedWallets.length === 0) return ALL_COINS
    const set = new Set<string>()
    connectedWallets.forEach((w) => {
      Object.keys(w.balances).forEach((c) => set.add(c))
    })
    return Array.from(set)
  }, [connectedWallets])

  // Баланс выбранной монеты
  const fromBalance = useMemo(() => {
    return connectedWallets.reduce((sum, w) => sum + (w.balances[fromCoin] || 0), 0)
  }, [connectedWallets, fromCoin])

  // Курс
  const rate = useMemo(() => {
    const fromUsd = RATES[fromCoin] || 1
    const toUsd = RATES[toCoin] || 1
    return fromUsd / toUsd
  }, [fromCoin, toCoin])

  // Пересчёт суммы «в»
  useEffect(() => {
    if (!fromAmount || isNaN(Number(fromAmount))) {
      setToAmount('')
      return
    }
    const result = Number(fromAmount) * rate
    setToAmount(result.toFixed(6).replace(/\.?0+$/, ''))
  }, [fromAmount, rate])

  const connectWallet = (wallet: Wallet) => {
    if (connectedWallets.find((w) => w.id === wallet.id)) {
      setConnectedWallets((prev) => prev.filter((w) => w.id !== wallet.id))
    } else {
      setConnectedWallets((prev) => [...prev, wallet])
    }
  }

  const handleSwap = () => {
    if (!fromAmount || Number(fromAmount) <= 0) return
    if (connectedWallets.length === 0) {
      alert('Сначала подключите кошелёк')
      return
    }
    if (Number(fromAmount) > fromBalance) {
      alert(`Недостаточно ${fromCoin}. Доступно: ${fromBalance}`)
      return
    }
    alert(`Обмен ${fromAmount} ${fromCoin} → ${toAmount} ${toCoin}\n(демо — реальный обмен появится позже)`)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Nemo</h1>
        <p>Обмен криптовалют</p>
      </header>

      <div className="wallets-bar">
        {DEMO_WALLETS.map((w) => {
          const isConnected = connectedWallets.some((c) => c.id === w.id)
          return (
            <button
              key={w.id}
              className={`wallet-btn ${isConnected ? 'connected' : ''}`}
              onClick={() => connectWallet(w)}
            >
              {isConnected ? '✓ ' : ''}{w.name}
            </button>
          )
        })}
      </div>

      <div className="card">
        <div className="row">
          <div className="field">
            <label>Отдаёте</label>
            <select
              className="select"
              value={fromCoin}
              onChange={(e) => setFromCoin(e.target.value)}
            >
              {availableCoins.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              min="0"
              step="any"
            />
            {connectedWallets.length > 0 && (
              <div className="balance">Баланс: {fromBalance} {fromCoin}</div>
            )}
          </div>

          <div className="field">
            <label>Получаете</label>
            <select
              className="select"
              value={toCoin}
              onChange={(e) => setToCoin(e.target.value)}
            >
              {ALL_COINS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="text"
              placeholder="0.0"
              value={toAmount}
              readOnly
            />
          </div>
        </div>

        <div className="rate">
          1 {fromCoin} = <strong>{rate.toFixed(6)}</strong> {toCoin}
        </div>

        <button
          className="swap-btn"
          onClick={handleSwap}
          disabled={!fromAmount || Number(fromAmount) <= 0}
        >
          Обменять
        </button>
      </div>

      <footer className="footer">
        {connectedWallets.length > 0
          ? `Подключено кошельков: ${connectedWallets.length}`
          : 'Подключите кошелёк, чтобы видеть только свои монеты'}
      </footer>
    </div>
  )
}
