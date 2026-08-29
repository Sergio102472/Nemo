namespace $ {
	export class $nemo_exchange extends $mol_view {

		@$mol_mem
		from_currency( next?: string ) {
			return next ?? 'BTC'
		}

		@$mol_mem
		to_currency( next?: string ) {
			return next ?? 'USDT'
		}

		/** Какое поле редактировал пользователь последним: from | to */
		@$mol_mem
		edit_side( next?: 'from' | 'to' ) {
			return next ?? 'from'
		}

		@$mol_mem
		rate() {
			// заглушка курса; позже — API
			const table: Record<string, number> = {
				BTC: 95000, ETH: 3200, USDT: 1, USDC: 1, SOL: 180, BNB: 580,
			}
			const a = table[ this.from_currency() ] ?? 1
			const b = table[ this.to_currency() ] ?? 1
			return a / b
		}

		fee_rate() {
			return 0.02 // 2%
		}

		@$mol_mem
		from_amount( next?: number ) {
			if( next !== undefined ) {
				this.edit_side( 'from' )
				return next
			}
			if( this.edit_side() === 'to' ) {
				const to = this.to_amount_raw()
				if( !to ) return 0
				// to = from * rate * (1 - fee)  =>  from = to / (rate * (1-fee))
				const net = this.rate() * ( 1 - this.fee_rate() )
				return net ? to / net : 0
			}
			return this.from_amount_raw()
		}

		@$mol_mem
		from_amount_raw( next?: number ) {
			return next ?? 0
		}

		@$mol_mem
		to_amount( next?: number ) {
			if( next !== undefined ) {
				this.edit_side( 'to' )
				return next
			}
			if( this.edit_side() === 'from' ) {
				const from = this.from_amount_raw()
				if( !from ) return 0
				return from * this.rate() * ( 1 - this.fee_rate() )
			}
			return this.to_amount_raw()
		}

		@$mol_mem
		to_amount_raw( next?: number ) {
			return next ?? 0
		}

		choose_from( event?: Event ) {
			const list = [ 'BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'BNB' ]
			const i = list.indexOf( this.from_currency() )
			this.from_currency( list[ ( i + 1 ) % list.length ] )
		}

		choose_to( event?: Event ) {
			const list = [ 'BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'BNB' ]
			const i = list.indexOf( this.to_currency() )
			this.to_currency( list[ ( i + 1 ) % list.length ] )
		}

	}
}
