namespace $ {
	export class $nemo_exchange extends $mol_view {

		@$mol_mem
		wallet( next?: Record<string, number> ) {
			return next ?? {
				BTC: 0.5, ETH: 4.2, USDT: 2500, USDC: 1000, SOL: 35, BNB: 8,
			}
		}

		@$mol_mem
		usd_rates( next?: Record<string, number> ) {
			return next ?? {
				BTC: 95000, ETH: 3200, USDT: 1, USDC: 1, SOL: 180, BNB: 580,
			}
		}

		@$mol_mem
		from_currency( next?: string ) {
			return next ?? 'BTC'
		}

		@$mol_mem
		to_currency( next?: string ) {
			return next ?? 'USDT'
		}

		@$mol_mem
		edit_side( next?: 'from' | 'to' ) {
			return next ?? 'from'
		}

		fee_rate() {
			return 0.02
		}

		pair_rate() {
			const u = this.usd_rates()
			return ( u[ this.from_currency() ] ?? 1 ) / ( u[ this.to_currency() ] ?? 1 )
		}

		from_balance_text() {
			const c = this.from_currency()
			const v = this.wallet()[ c ] ?? 0
			return `Баланс: ${ v } ${ c }`
		}

		to_balance_text() {
			const c = this.to_currency()
			const v = this.wallet()[ c ] ?? 0
			return `Баланс: ${ v } ${ c }`
		}

		from_rate_text() {
			const c = this.from_currency()
			const p = this.usd_rates()[ c ] ?? 0
			return `$${ p }`
		}

		to_rate_text() {
			const c = this.to_currency()
			const p = this.usd_rates()[ c ] ?? 0
			return `$${ p }`
		}

		@$mol_mem
		from_amount_raw( next?: number ) {
			return next ?? 0
		}

		@$mol_mem
		to_amount_raw( next?: number ) {
			return next ?? 0
		}

		@$mol_mem
		from_amount( next?: number ) {
			if( next !== undefined ) {
				this.edit_side( 'from' )
				return this.from_amount_raw( next )
			}
			if( this.edit_side() === 'to' ) {
				const to = this.to_amount_raw()
				if( !to ) return 0
				const net = this.pair_rate() * ( 1 - this.fee_rate() )
				return net ? to / net : 0
			}
			return this.from_amount_raw()
		}

		@$mol_mem
		to_amount( next?: number ) {
			if( next !== undefined ) {
				this.edit_side( 'to' )
				return this.to_amount_raw( next )
			}
			if( this.edit_side() === 'from' ) {
				const from = this.from_amount_raw()
				if( !from ) return 0
				return from * this.pair_rate() * ( 1 - this.fee_rate() )
			}
			return this.to_amount_raw()
		}

		can_swap() {
			const v = this.from_amount()
			const bal = this.wallet()[ this.from_currency() ] ?? 0
			return v > 0 && this.from_currency() !== this.to_currency() && v <= bal
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

		do_swap( event?: Event ) {
			if( !this.can_swap() ) return
			const from = this.from_currency()
			const to = this.to_currency()
			const fromAmt = this.from_amount()
			const toAmt = this.to_amount()
			const w = { ...this.wallet() }
			w[ from ] = +( ( w[ from ] ?? 0 ) - fromAmt ).toFixed( 10 )
			w[ to ] = +( ( w[ to ] ?? 0 ) + toAmt ).toFixed( 10 )
			this.wallet( w )
			this.from_amount_raw( 0 )
			this.to_amount_raw( 0 )
		}

	}
}
