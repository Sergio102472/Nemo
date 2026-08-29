namespace $.$$ {

	export class $nemo_module1 extends $.$nemo_module1 {

		@ $mol_mem
		from_currency( next?: string ) {
			if ( next !== undefined ) {
				this.log( `Выбрана валюта «из»: ${next}` )
				return next
			}
			return 'ETH'
		}

		@ $mol_mem
		to_currency( next?: string ) {
			if ( next !== undefined ) {
				this.log( `Выбрана валюта «в»: ${next}` )
				return next
			}
			return 'USDT'
		}

		@ $mol_mem
		currency_options() {
			return [
				'BTC',
				'ETH',
				'USDT',
				'USDC',
				'SOL',
				'BNB',
			]
		}

		// Демо-курсы в USD (позже — реальный API)
		@ $mol_mem
		rates_usd() {
			return {
				BTC: 95000,
				ETH: 3200,
				USDT: 1,
				USDC: 1,
				SOL: 180,
				BNB: 580,
			} as Record<string, number>
		}

		@ $mol_mem
		rate() {
			const from = this.rates_usd()[ this.from_currency() ] || 1
			const to = this.rates_usd()[ this.to_currency() ] || 1
			const r = from / to
			this.log( `Курс обновлён: 1 ${this.from_currency()} = ${r.toFixed(6)} ${this.to_currency()}` )
			return r
		}

		@ $mol_mem
		rate_text() {
			return `1 ${this.from_currency()} ≈ ${this.rate().toFixed(6)} ${this.to_currency()}`
		}

		@ $mol_mem
		can_swap() {
			return this.from_currency() !== this.to_currency()
		}

		// ——— Лог действий (информационное окошко) ———
		@ $mol_mem
		logs( next?: string[] ) {
			return next ?? [ 'Модуль 1 загружен', 'Ожидание действий пользователя...' ]
		}

		log( message: string ) {
			const time = new Date().toLocaleTimeString( 'ru-RU' )
			const entry = `[${time}] ${message}`
			this.logs( [ entry, ...this.logs() ].slice( 0, 20 ) )
		}

		@ $mol_mem
		log_rows() {
			return this.logs().map( ( text, i ) => this.Log_row( i ) )
		}

		@ $mol_mem_key
		Log_row( index: number ) {
			const row = new this.$.$mol_text
			row.text = () => this.logs()[ index ]
			return row
		}

		event_swap( next?: Event ) {
			if ( next === undefined ) return null as any

			const quantum = Date.now()
			this.log( `Нажата кнопка «Обменять»` )
			this.log( `Создан токен (квант времени): ${quantum}` )
			this.log( `Ордер: ${this.from_currency()} → ${this.to_currency()} по курсу ${this.rate().toFixed(6)}` )
			this.log( `Внутренний обмен выполнен (демо)` )

			return null as any
		}

	}

}
