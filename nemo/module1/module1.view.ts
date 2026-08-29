namespace $.$$ {

	export class $nemo_module1 extends $.$nemo_module1 {

		@ $mol_mem
		from_currency( next?: string ) {
			if ( next !== undefined ) {
				this.log( `Выбрана валюта «из»: ${next}` )
				this.prev_pair_rate( null )
				return next
			}
			return 'ETH'
		}

		@ $mol_mem
		to_currency( next?: string ) {
			if ( next !== undefined ) {
				this.log( `Выбрана валюта «в»: ${next}` )
				this.prev_pair_rate( null )
				return next
			}
			return 'USDT'
		}

		@ $mol_mem
		from_amount( next?: number ) {
			if ( next !== undefined ) {
				if ( next > 0 ) this.log( `Введена сумма: ${next} ${this.from_currency()}` )
				return next
			}
			return 0
		}

		@ $mol_mem
		currency_options() {
			return [ 'BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'BNB' ]
		}

		@ $mol_mem
		rates_usd( next?: Record<string, number> ) {
			return next ?? {
				BTC: 95000,
				ETH: 3200,
				USDT: 1,
				USDC: 1,
				SOL: 180,
				BNB: 580,
			}
		}

		@ $mol_mem
		prev_pair_rate( next?: number | null ) {
			return next !== undefined ? next : null as number | null
		}

		@ $mol_mem
		rate() {
			const from = this.rates_usd()[ this.from_currency() ] || 1
			const to = this.rates_usd()[ this.to_currency() ] || 1
			return from / to
		}

		@ $mol_mem
		tick_dir() {
			const prev = this.prev_pair_rate()
			const cur = this.rate()
			if ( prev == null ) return 'flat' as const
			if ( cur > prev ) return 'up' as const
			if ( cur < prev ) return 'down' as const
			return 'flat' as const
		}

		@ $mol_mem
		rate_text() {
			const dir = this.tick_dir()
			const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '●'
			return `1 ${this.from_currency()} ≈ ${this.rate().toFixed(6)} ${this.to_currency()}  ${arrow}`
		}

		@ $mol_mem
		to_amount() {
			const amount = this.from_amount()
			if ( !amount || amount <= 0 ) return 0
			return +( amount * this.rate() ).toFixed( 8 )
		}

		@ $mol_mem
		can_swap() {
			return this.from_currency() !== this.to_currency() && this.from_amount() > 0
		}

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
			return this.logs().map( ( _, i ) => this.Log_row( i ) )
		}

		@ $mol_mem_key
		Log_row( index: number ) {
			const row = new this.$.$mol_text
			row.text = () => this.logs()[ index ]
			return row
		}

		/** Тик: лёгкое случайное изменение курса (симуляция live) */
		@ $mol_mem
		rate_tick( next?: number ) {
			const stamp = next ?? Date.now()
			const rates = { ...this.rates_usd() }
			const prev = this.rate()

			for ( const k of Object.keys( rates ) ) {
				if ( k === 'USDT' || k === 'USDC' ) continue
				const jitter = 1 + ( Math.random() - 0.5 ) * 0.004
				rates[ k ] = +( rates[ k ] * jitter ).toFixed( 4 )
			}

			this.rates_usd( rates )
			const cur = this.rate()
			this.prev_pair_rate( prev )

			if ( cur > prev ) this.log( `Тик ▲ курс вырос: 1 ${this.from_currency()} = ${cur.toFixed(6)} ${this.to_currency()}` )
			else if ( cur < prev ) this.log( `Тик ▼ курс упал: 1 ${this.from_currency()} = ${cur.toFixed(6)} ${this.to_currency()}` )

			return stamp
		}

		event_swap( next?: Event ) {
			if ( next === undefined ) return null as any

			const quantum = Date.now()
			const fromAmt = this.from_amount()
			const toAmt = this.to_amount()

			this.log( `Нажата кнопка «Обменять»` )
			this.log( `Создан токен (квант времени): ${quantum}` )
			this.log( `Ордер: ${fromAmt} ${this.from_currency()} → ${toAmt} ${this.to_currency()} (курс ${this.rate().toFixed(6)})` )
			this.log( `Внутренний обмен выполнен (демо)` )

			return null as any
		}

	}

}
