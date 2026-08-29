import { useState, useEffect, useMemo } from 'react'
import './App.css'

// Тип кошелька
type Wallet = {
  id: string
  name: string
  address: string
  balances: Record<string, number>
}

// Токен / ордер на основе кванта времени
type TimeToken = {
  id: string          // квант времени (timestamp)
  timestamp: number
  fromCoin: string
  fromAmount: number
  toCoin: string
  toAmount: number
  rate: number
  wallets: string[]   // id кошельков, участвовавших в обмене
}

// Демо-кошельки
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

// Курсы в USD (демо; позже можно заменить на CoinGecko)
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
  const [orders, setOrders] = useState<TimeToken[]>([])
  const [lastToken, setLastToken] = useState<TimeToken | null>(null)

  // Список монет, которыми владеет пользователь
  const availableCoins = useMemo(() => {
    if (connectedWallets.length === 0) return ALL_COINS
    const set = new Set<string>()
    connectedWallets.forEach((w) => {
      Object.keys(w.balances).forEach((c) => {
        if ((w.balances[c] || 0) > 0) set.add(c)
      })
    })
    return Array.from(set)
  }, [connectedWallets])

  // Общий баланс выбранной монеты
  const fromBalance = useMemo(() => {
    return connectedWallets.reduce((sum, w) => sum + (w.balances[fromCoin] || 0), 0)
  }, [connectedWallets, fromCoin])

  // Курс: 1 fromCoin = X toCoin
  const rate = useMemo(() => {
    const fromUsd = RATES[fromCoin] || 1
    const toUsd = RATES[toCoin] || 1
    return fromUsd / toUsd
  }, [fromCoin, toCoin])

  // Автоматический пересчёт суммы «получаете»
  useEffect(() => {
    if (!fromAmount || isNaN(Number(fromAmount))) {
      setToAmount('')
      return
    }
    const result = Number(fromAmount) * rate
    setToAmount(result.toFixed(8).replace(/\.?0+$/, ''))
  }, [fromAmount, rate])

  // Подключение / отключение кошелька
  const connectWallet = (wallet: Wallet) => {
    if (connectedWallets.find((w) => w.id === wallet.id)) {
      setConnectedWallets((prev) => prev.filter((w) => w.id !== wallet.id))
    } else {
      // Клонируем, чтобы можно было менять балансы
      setConnectedWallets((prev) => [...prev, { ...wallet, balances: { ...wallet.balances } }])
    }
  }

  // === Главная логика обмена ===
  const handleSwap = () => {
    const amount = Number(fromAmount)
    if (!amount || amount <= 0) return

    if (connectedWallets.length === 0) {
      alert('Сначала подключите хотя бы один кошелёк')
      return
    }

    if (amount > fromBalance) {
      alert(`Недостаточно ${fromCoin}. Доступно: ${fromBalance}`)
      return
    }

    // 1. Фиксируем квант времени — это и есть токен
    const quantum = Date.now()
    const received = Number(toAmount)

    const token: TimeToken = {
      id: String(quantum),
      timestamp: quantum,
      fromCoin,
      fromAmount: amount,
      toCoin,
      toAmount: received,
      rate,
      wallets: connectedWallets.map((w) => w.id),
    }

    // 2. Внутренний обмен: списываем и зачисляем средства
    setConnectedWallets((prev) => {
      let remainingToDeduct = amount
      return prev.map((w) => {
        const newBalances = { ...w.balances }

        // Списание fromCoin пропорционально (или полностью с первого подходящего)
        if (remainingToDeduct > 0 && (newBalances[fromCoin] || 0) > 0) {
          const canTake = Math.min(newBalances[fromCoin], remainingToDeduct)
          newBalances[fromCoin] = +(newBalances[fromCoin] - canTake).toFixed(8)
          remainingToDeduct -= canTake
        }

        // Зачисление toCoin (на первый кошелёк для простоты, или распределяем)
        // Здесь зачисляем на тот же кошелёк, с которого списали
        if (canTake > 0) {
          const proportion = canTake / amount
          newBalances[toCoin] = +((newBalances[toCoin] || 0) + received * proportion).toFixed(8)
        }

        return { ...w, balances: newBalances }
      })
    })

    // 3. Сохраняем токен в архив ордеров
    setOrders((prev) => [token, ...prev])
    setLastToken(token)

    // Очищаем поле ввода
    setFromAmount('')
    setToAmount('')
  }

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Nemo</h1>
        <p>Обмен криптовалют · токен = квант времени</p>
      </header>

      {/* Подключение кошельков */}
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

      {/* Карточка обмена */}
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
                <option key={c} value={c}>{c}</option>
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
              <div className="balance">Баланс: {fromBalance.toFixed(6)} {fromCoin}</div>
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
                <option key={c} value={c}>{c}</option>
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
          1 {fromCoin} ≈ <strong>{rate.toFixed(6)}</strong> {toCoin}
        </div>

        <button
          className="swap-btn"
          onClick={handleSwap}
          disabled={!fromAmount || Number(fromAmount) <= 0}
        >
          Обменять
        </button>
      </div>

      {/* Последний созданный токен */}
      {lastToken && (
        <div className="token-card">
          <div className="token-title">Токен создан (квант времени)</div>
          <div className="token-id">ID: {lastToken.id}</div>
          <div className="token-details">
            {lastToken.fromAmount} {lastToken.fromCoin} → {lastToken.toAmount} {lastToken.toCoin}
            <br />
            <span className="token-time">{formatTime(lastToken.timestamp)}</span>
          </div>
        </div>
      )}

      {/* Архив ордеров */}
      {orders.length > 0 && (
        <div className="orders">
          <h3>Архив ордеров (токены)</h3>
          <ul>
            {orders.map((o) => (
              <li key={o.id}>
                <span className="order-time">{formatTime(o.timestamp)}</span>
                <span className="order-pair">
                  {o.fromAmount} {o.fromCoin} → {o.toAmount.toFixed(6)} {o.toCoin}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="footer">
        {connectedWallets.length > 0
          ? `Подключено кошельков: ${connectedWallets.length}`
          : 'Подключите кошелёк, чтобы видеть только свои монеты'}
      </footer>
    </div>
  )
}
