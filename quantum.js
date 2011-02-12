/*!
 * Copyright ( C ) 2011 Dylon Edwards
 *
 * This code is available under MIT License.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files ( the "Software" ), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*jslint
	bitwise  : false,
	browser  : true,
	devel    : true,
	eqeqeq   : true,
	evil     : false,
	immed    : true,
	nomen    : false,
	newcap   : true,
	onevar   : true,
	plusplus : false,
	regexp   : false,
	strict   : false,
	undef    : true,
	white    : false
*/

// Intialize the global namespace for this plugin
var Q = {};

(function( Q ) {

	var MS_PER_SEC, MS_PER_MIN, MS_PER_HR, MAX;
	MS_PER_SEC = 1000;             //< Milliseconds per second
	MS_PER_MIN = MS_PER_SEC * 60;  //< Milliseconds per minute
	MS_PER_HR  = MS_PER_MIN * 60;  //< Milliseconds per hour

	// Binary operation which determines the maximum value of two parameters
	MAX = Math.max;


	//
	// Initialize the Quantum constructor function
	//
	

	/**
	 * A time quantum between the given start and stop times, which should be
	 * specified in milliseconds.
	 *
	 * @param {number} start
	 * Time at which this Quantum began, in milliseconds
	 *
	 * @param {number} stop
	 * Time at which this Quantum ended, in milliseconds
	 *
	 * @constructor
	 */
	function Quantum( start, stop ) {
		this.start = ( start || 0 );
		this.stop = ( stop || 0 );
	}

	/**
	 * Number of hours contained within this quantum
	 *
	 * @return {number}
	 * The ratio of the difference between stop and start and MS_PER_HR
	 */
	Quantum.prototype.hours = function() {
		return this.millis() / MS_PER_HR;
	};

	/**
	 * Number of minutes contained within this quantum
	 *
	 * @return {number}
	 * The ratio of the difference between stop and start and MS_PER_MIN
	 */
	Quantum.prototype.minutes = function() {
		return this.millis() / MS_PER_MIN;
	};

	/**
	 * Number of seconds contained within this quantum
	 *
	 * @return {number}
	 * The ratio of the difference between stop and start and MS_PER_SEC
	 */
	Quantum.prototype.seconds = function() {
		return this.millis() / MS_PER_SEC;
	};

	/**
	 * Number of milliseconds contained within this quantum
	 *
	 * @return {number}
	 * The difference between stop and start
	 */
	Quantum.prototype.millis = function() {
		return ( this.stop - this.start );
	};

	/**
	 * Returns a string representing the inclusive range of this Quantum, from
	 * its start to stop time.
	 *
	 * @return {string}
	 * An inclusive range consisting of this Quantum's start and stop times
	 */
	Quantum.prototype.toString = function() {
		return '[ ' + this.start + ', ' + this.stop + ' ]';
	};

	
	//
	// Initialize the QuantumSet constructor function
	//


	/**
	 * Constructs a new Quantum set which includes some handy utility methods
	 * 
	 * @param {array.<Quantum>} args
	 * An array of Quantums to add to this set
	 *
	 * @constructor
	 */
	function QuantumSet( args ) {
		this._set = [];
		
		if ( args ) {
			this.push( args );
		}
	}

	/**
	 * Default comparator for QuantumSet.  Compares two Quantums, q1 and q2,
	 * such that a monotone increasing set may be constructed according to the
	 * start times of the two.
	 *
	 * @param {Quantum} q1
	 * LHS of the comparison operation
	 *
	 * @param {Quantum} q2
	 * RHS of the comparison operation
	 *
	 * @return {boolean}
	 * Whether the start time of q1 is at least that of q2
	 */
	QuantumSet.prototype.compare = function( q1, q2 ) {
		return ( q1.start >= q2.start );
	};

	/**
	 * Adds all of an array of Quantums to this QuantumSet
	 *
	 * @param {array.<Quantum>} args
	 * Array of Quantums to add to this set
	 */
	QuantumSet.prototype.push = function( args ) {
		Array.prototype.push.apply( this._set, args );
	};

	/**
	 * Returns the Quantums in this QuantumSet ordered according to either
	 * the compare parameter or this.compare (the default).  The intention
	 * here is to return a monotone increasing set of Quantums.
	 *
	 * @param {function( q1, q2 )} compare
	 * An [optional] comparator for sorting the Quantums in this QuantumSet
	 *
	 * @return {array.<Quantum>}
	 * A monotonic array of Quantums
	 */
	QuantumSet.prototype.monotonic = function( compare ) {
		var set = this._set.slice();
		set.sort(( compare || this.compare ));
		return set;
	};

	/**
	 * Setter / Getter method for this QuantumSet
	 *
	 * @param {array.<Quantum>} set
	 * An [optional] array of Quantums. If specified, it overrides this._set.
	 *
	 * @return {array.<Quantum>}
	 * The array of Quantums in this QuantumSet
	 */
	QuantumSet.prototype.set = function( set ) {
		if ( set ) {
			this._set = set;
		}

		return this._set;
	};

	/**
	 * Determines whether the two Quantum parameters, q1 and q2, intersect.
	 *
	 * @param {Quantum} q1
	 * First Quantum to compare
	 *
	 * @param {Quantum} q2
	 * Second Quantum to compare
	 *
	 * @return {boolean}
	 * Whether q1 intersects q2
	 */
	QuantumSet.prototype.intersect = function( q1, q2 ) {
		var q1a, q1B, q2a, q2B;
		q1a = q1.start;
		q1B = q1.stop;
		q2a = q2.start;
		q2B = q2.stop;

		return ((( q1a <= q2a ) && ( q1B >= q2a )) || 
			(( q2a <= q1a) && ( q2B >= q1a )));
	};
	
	/**
	 * Merges two Quantum parameters, q1 and q2, to form a single, monotone
	 * increasing set.
	 *
	 * Note: that this method will return a set such that
	 * 1 <= |set| <= 2
	 *
	 * @param {Quantum} q1
	 * First of two Quantums with which to construct the set
	 *
	 * @param {Quantum} q2
	 * Second of two Quantums with which to construct the set
	 *
	 * @return {array.<Quantum>}
	 * A monotone increasing set of Quantums
	 */
	QuantumSet.prototype.merge = function( q1, q2 ) {
		var a, B, q;

		if ( this.intersect( q1, q2 )) {
			a = q1.start;
			B = MAX( q1.stop, q2.stop );
			q = new Quantum( a, B );
			return [ q ];
		}

		return [ q1, q2 ];
	};

	/**
	 * Returns a disjoint, monotone increasing set of Quantums from those in
	 * this QuantumSet.
	 *
	 * @param {boolean} monotonic
	 * Whether the elements in this QuantumSet have already been sorted
	 * monotonically
	 *
	 * @return {array.<Quantum>}
	 * A disjoint, monotone increasing set of Quantums
	 */
	QuantumSet.prototype.disjoint = function( monotonic ) {
		var set, $set, _set, q, i, k, n;

		set = (( !monotonic ) ?
			this.monotonic() : 
			this._set );

		_set = [];

		q = set[ 0 ];
		k = set.length;
		for ( i = 1; i < k; ++ i ) {
			$set = this.merge( q, set[ i ] );
			n = $set.length - 1;

			if ( n ) {
				_set.push( $set[ 0 ] );
			}

			q = $set[ n ];
		}

		_set.push( q );
		return _set;
	};

	/**
	 * Calculates and returns the number of hours of all the Quantums in this
	 * QuantumSet
	 *
	 * @return {number}
	 * Number of hours of all the Quantums in this QuantumSet
	 */
	QuantumSet.prototype.hours = function() {
		return this.millis() / MS_PER_HR;
	};

	/**
	 * Calculates and returns the number of minutes of all the Quantums in this
	 * QuantumSet
	 *
	 * @return {number}
	 * Number of minutes of all the Quantums in this QuantumSet
	 */
	QuantumSet.prototype.minutes = function() {
		return this.millis() / MS_PER_MIN;
	};

	/**
	 * Calculates and returns the number of seconds of all the Quantums in this
	 * QuantumSet
	 *
	 * @return {number}
	 * Number of seconds of all the Quantums in this QuantumSet
	 */
	QuantumSet.prototype.seconds = function() {
		return this.millis() / MS_PER_SEC;
	};

	/**
	 * Calculates and returns the number of milliseconds of all the Quantums in
	 * this QuantumSet
	 *
	 * @return {number}
	 * Number of milliseconds of all the Quantums in this QuantumSet
	 */
	QuantumSet.prototype.millis = function() {
		var millis, s, i, k;
		s = this._set;
		millis = 0;

		k = s.length;
		for ( i = 0; i < k; ++ i ) {
			millis += s[ i ].millis();
		}

		return millis;
	};

	/**
	 * Returns a set string containing all of the Quantum ranges in this
	 * QuantumSet.
	 *
	 * @return {string}
	 * A set of Quantum ranges
	 */
	QuantumSet.prototype.toString = function() {
		var buf, s, i, k;
		
		buf = [];
		s = this._set;
		k = s.length;

		for ( i = 0; i < k; ++ i ) {
			buf.push( s[ i ].toString());
		}

		return '{' + buf.join( ', ' ) + '}';
	};


	//
	// Initialize the Unit Test
	//
	

	function Test( name, fn, emsg ) {
		this.name = name;
		this.fn = fn;
		this.emsg = ( emsg || "" );
	}

	Test.prototype.error = function() {
		if ( typeof( this.emsg ) === 'function' ) {
			return this.emsg();
		}

		return this.emsg;
	};

	Test.prototype.toString = function() {
		return this.name;
	};


	//
	// Initialize the Unit Testing Suite
	//
	

	function Unit() {
		this.init();
		this.reset();
	}

	Unit.prototype.init = function() {
		this._tests = [];
	};

	Unit.prototype.reset = function() {
		this._failed = [];
	};

	Unit.prototype.failed = function() {
		return this._failed;
	};

	Unit.prototype.test = function() {
		var f, s, t, i, k;

		f = this._failed;
		s = this._tests;
		k = s.length;

		for ( i = 0; i < k; ++ i ) {
			t = s[ i ];

			if ( !t.fn( this )) {
				f.push( t );
			}
		}

		return ( f.length === 0 );
	};


	//
	//
	//


	function TimeTest( name, unit, vals ) {
		Test.call( this, name, this.run );
		this.unit = unit;
		this.vals = vals;
	}

	TimeTest.prototype = new Test();
	TimeTest.prototype.constructor = TimeTest;

	TimeTest.prototype.fail = function( f, q, v, e ) {
		f.push(( "Quantum(" + q.toString() + ") : " + v + " !== " + e ));
	};

	TimeTest.prototype.run = function( suite ) {
		var set, unit, vals, f, q, i, k, v, e;

		this.emsg = "";

		unit = this.unit;
		vals = this.vals;

		set = suite.set().set();
		f = [];

		k = vals.length;
		
		if ( k !== set.length ) {
			this.emsg = ( "Unmatched array lengths: " + k + " !== " + set.length );
			return false;
		}

		for ( i = 0; i < k; ++ i ) {
			q = set[ i ];
			e = vals[ i ];
			v = q[ unit ].apply( q );
			
			if ( v !== e ) {
				this.fail( f, q, v, e );
			}
		}

		if ( f.length !== 0 ) {
			this.emsg = f.join( ',\n' );
			return false;
		}
		
		return true;
	};


	//
	// Initialize the Quantum Unit Testing Suite
	//


	function QUnit() {
		Unit.call( this );
	}

	QUnit.prototype = new Unit();
	QUnit.prototype.constructor = QUnit;

	QUnit.prototype.init = function() {
		var tests;

		Unit.prototype.init.call( this );
		tests = this._tests;

		tests.push( new Test( "Initial Set Length", function( suite ) {
			var set, retval, LEN;

			this.emsg = "";

			LEN = 5;
			set = suite.set().set();
			retval = ( set.length === LEN );

			if ( !retval ) {
				this.emsg = ( set.length + ' !== ' + LEN );
			}

			return retval;
		}));

		tests.push( new TimeTest( "Validating Milliseconds", "millis", [
			198, 
			80545396, 
			21099, 
			235000359315, 
			12340
		]));

		tests.push( new TimeTest( "Validating Seconds", "seconds", [
			( 198 / 1000 ),
			( 80545396 / 1000 ),
			( 21099 / 1000 ),
			( 235000359315 / 1000 ),
			( 12340 / 1000 )
		]));

		tests.push( new TimeTest( "Validating Minutes", "minutes", [
			( 198 / ( 1000 * 60 )),
			( 80545396 / ( 1000 * 60 )),
			( 21099 / ( 1000 * 60 )),
			( 235000359315 / ( 1000 * 60 )),
			( 12340 / ( 1000 * 60 ))
		]));

		tests.push( new TimeTest( "Validating Hours", "hours", [
			( 198 / ( 1000 * 60 * 60 )),
			( 80545396 / ( 1000 * 60 * 60 )),
			( 21099 / ( 1000 * 60 * 60 )),
			( 235000359315 / ( 1000 * 60 * 60 )),
			( 12340 / ( 1000 * 60 * 60 ))
		]));

		tests.push( new Test( "compare( 1, 2 ) === false", function( suite ) {
			var q1, q2;

			q1 = new Quantum( 1, 2 );
			q2 = new Quantum( 2, 3 );

			return suite.set().compare( q1, q2 ) === false;
		}, "[ 1, 2 ] is greater than [ 2, 3 ]"));

		tests.push( new Test( "compare( 2, 1 ) === true", function( suite ) {
			var q1, q2;

			q1 = new Quantum( 2, 3 );
			q2 = new Quantum( 1, 2 );

			return ( suite.set().compare( q1, q2 ) === true );
		}, "[ 2, 3 ] is less than [ 1, 2 ]"));

		tests.push( new Test( "compare( 1, 1 ) === true", function( suite ) {
			var q1, q2;

			q1 = new Quantum( 1, 2 );
			q2 = new Quantum( 1, 3 );

			return ( suite.set().compare( q1, q2 ) === true );
		}, "[ 1, 2 ] is not equal to [ 1, 3 ]"));

		tests.push( new Test( "Validating Monotonicity", function( suite ) {
			var set = suite.set().monotonic();

			if (( set[ 0 ].start !== 2 ) ||
				( set[ 1 ].start !== 123 ) ||
				( set[ 2 ].start !== 2322 ) ||
				( set[ 3 ].start !== 2342933 ) ||
				( set[ 4 ].start !== 3232123423 )) {
				
				this.emsg = ( "Set is not monotone increasing: " + suite.toString());
				return false;
			}

			return true;
		}));

		tests.push( new Test( "Validating Intersections", function( suite ) {
			var set, $set, mtrx, buf, q1, q2, i, j, k, v;
			set = suite.set();
			$set = set.set();
			buf = [];

			this.emsg = "";

			function fail( q1, q2, v ) {
				var imsg = (( v ) ?  " intersect." : " do not intersect." );
				buf.push( q1.toString() + " and " + q2.toString() + imsg );
			}

			mtrx = [
				[ true  , false , false , false , true  ],
				[ false , true  , false , false , false ],
				[ false , false , true  , false , true  ],
				[ false , false , false , true  , false ],
				[ true  , false , true  , false , true  ]
			];

			k = $set.length;

			if ( mtrx.length !== k ) {
				this.emsg = ( "Array lengths do not match: " + mtrx.length + " !== " + k );
				return false;
			}

			for ( i = 0; i < k; ++ i ) {
				q1 = $set[ i ];

				for ( j = 0; j < k; ++ j ) {
					q2 = $set[ j ];
					v  = mtrx[ i ][ j ];

					if ( set.intersect( q1, q2 ) !== v ) {
						fail( i, j, q1, q2, !v );
					}
				}
			}

			if ( buf.length !== 0 ) {
				this.emsg = buf.join( ',\n' );
				return false;
			}

			return true;
		}));
	};

	QUnit.prototype.reset = function() {
		var set;

		Unit.prototype.reset.call( this );
		
		set = new QuantumSet([
			new Quantum( 123, 321 ),
			new Quantum( 2342933, 82888329 ),
			new Quantum( 2322, 23421 ),
			new Quantum( 3232123423, 238232482738 ),
			new Quantum( 2, 12342 )
		]);

		this._set = set;
	};

	QUnit.prototype.set = function() {
		return this._set;
	};


	//
	// Populate the namespace
	//


	Q.Quantum = Quantum;
	Q.QuantumSet = QuantumSet;
	Q.QUnit = QUnit;
	Q.Unit = Unit;
	Q.Test = Test;
}( Q ));

