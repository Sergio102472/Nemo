namespace $ {

	export class $nemo_app extends $mol_page {

		// --- Состояние ---

		@ $mol_mem
		from_currency( next?: string ) {
			if( next !== undefined ) this.log( `Выбрана валюта «из»: ${next}` )
			return next ?? 'ETH'
		}

		@ $mol_mem
		to_currency( next?: string ) {
			if( next !== undefined ) this.log( `Выбрана валюта «в»: ${next}` )
			return next ?? 'USDT'
		}

		@ $mol_mem
		from_amount( next?: number ) {
			if( next !== undefined ) this.log( `Введена сумма: ${next}` )
			return next ?? 0
		}

		// --- Список валют ---

		@ $mol_mem
		currency_options() {
			return [ 'BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'BNB' ]
		}

		@ $mol_mem
		currency_dict() {
			return {
				'BTC' : 'Bitcoin (BTC)' ,
				'ETH' : 'Ethereum (ETH)' ,
				'USDT' : 'Tether (USDT)' ,
				'USDC' : 'USD Coin (USDC)' ,
				'SOL' : 'Solana (SOL)' ,
				'BNB' : 'BNB' ,
			}
		}

		// --- Курсы (демо, обновляются каждые 5 сек) ---

		@ $mol_mem
		rates() {
			// Имитируем «живой» курс небольшим случайным отклонением
			$mol_state_time.now( 5000 ) // пересчёт каждые 5 секунд

			const base: Record<string, number> = {
				BTC: 95000,
				ETH: 3200,
				USDT: 1,
				USDC: 1,
				SOL: 180,
				BNB: 580,
			}

			const result: Record<string, number> = {}
			for( const coin of Object.keys( base ) ) {
				const noise = 1 + ( Math.random() - 0.5 ) * 0.004 // ±0.2%
				result[ coin ] = base[ coin ] * noise
			}

			this.log( 'Курсы обновлены' )
			return result
		}

		@ $mol_mem
		rate() {
			const rates = this.rates()
			const from = rates[ this.from_currency() ] || 1
			const to = rates[ this.to_currency() ] || 1
			return from / to
		}

		@ $mol_mem
		rate_text() {
			const r = this.rate()
			return `1 ${this.from_currency()} ≈ ${r.toFixed(6)} ${this.to_currency()}`
		}

		@ $mol_mem
		to_amount_text() {
			const amount = this.from_amount()
			if( !amount || amount <= 0 ) return '0'
			const result = amount * this.rate()
			return result.toFixed(8).replace( /\.?0+$/, '' )
		}

		// --- Лог действий (верхнее окошко) ---

		@ $mol_mem
		log_messages( next?: string[] ) {
			return next ?? [ 'Приложение запущено' ]
		}

		log( message: string ) {
			const time = new Date().toLocaleTimeString( 'ru-RU' )
			const entry = `[${time}] ${message}`
			const prev = this.log_messages()
			// Добавляем в начало, ограничиваем 12 записями
			this.log_messages( [ entry, ...prev ].slice( 0, 12 ) )
		}

		@ $mol_mem
		log_rows() {
			return this.log_messages().map( ( msg, i ) => this.Log_row( i ) )
		}

		@ $mol_mem_key
		Log_row( index: number ) {
			return new this.$.$mol_text().text( this.log_messages()[ index ] )
		}

		// --- Кнопка Обменять ---

		@ $mol_mem
		can_exchange() {
			return this.from_amount() > 0
		}

		exchange_click( next?: Event ) {
			if( next === undefined ) return null

			const amount = this.from_amount()
			const rate = this.rate()
			const received = amount * rate
			const quantum = Date.now()

			this.log(
				`ОБМЕН: ${amount} ${this.from_currency()} → ${received.toFixed(6)} ${this.to_currency()} | токен=${quantum}`
			)

			// Здесь позже будет создание токена-кванта и обновление балансов
			return null
		}

	}

}
