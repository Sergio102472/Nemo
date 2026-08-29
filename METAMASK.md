# MetaMask в Nemo

## Что возможно

| Действие | Можно? | Как |
|----------|--------|-----|
| **Подключить** существующий MetaMask | Да | `eth_requestAccounts` через `window.ethereum` |
| Читать адрес и баланс ETH | Да | `eth_getBalance` |
| Подписывать / отправлять транзакции | Да | `eth_sendTransaction`, `personal_sign` |
| **Создать** новый кошелёк MetaMask внутри Nemo | **Нет** | Только внутри приложения MetaMask (SRP/ключи не отдаются dapp) |

## Инструменты

1. **Provider API** — `window.ethereum` (расширение браузера)
2. **MetaMask Connect** — `@metamask/connect-evm` (desktop + mobile)
3. **Legacy SDK** — `@metamask/sdk`
4. **EIP-6963** — обнаружение нескольких кошельков в браузере

Документация: https://docs.metamask.io/

## В прототипе

Кнопка **«Кошельки»** → **«Подключить MetaMask»**  
Нужно расширение MetaMask в браузере. На `htmlpreview` / localhost расширение работает; на `file://` — часто нет.
