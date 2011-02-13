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

/*global Q */

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

(function( Q ) {
	

	//
	// Initialize the Unit Test
	//
	

	/**
	 * Constructs a new unit test
	 *
	 * @param {string} name
	 * The name of this unit test
	 *
	 * @param {function( suite )} fn
	 * Function which returns whether this unit test was successful
	 *
	 * @param {string} emsg
	 * Error message for this unit test
	 *
	 * @constructor
	 */
	function Unit( name, fn, emsg ) {
		this.name = name;
		this.fn = fn;
		this.emsg = ( emsg || "" );
	}

	/**
	 * Returns the error string containing why this unit test failed
	 *
	 * @return {string}
	 * The error string for this unit test
	 */
	Unit.prototype.error = function() {
		if ( typeof( this.emsg ) === 'function' ) {
			return this.emsg();
		}

		return this.emsg;
	};

	/**
	 * Returns the name of this unit test
	 *
	 * @return {string}
	 * The name of this unit test
	 */
	Unit.prototype.toString = function() {
		return this.name;
	};


	//
	// Initialize the Unit Testing Suite
	//
	

	/**
	 * Constructs a new unit testing suite
	 *
	 * @constructor
	 */
	function Suite() {
		this.init();
		this.reset();
	}

	/**
	 * Initializes this suite
	 */
	Suite.prototype.init = function() {
		this._tests = [];
	};

	/**
	 * Resets the objects used in this suite
	 */
	Suite.prototype.reset = function() {
		this._failed = [];
	};

	/**
	 * Returns the array of failed unit tests of this suite
	 *
	 * @return {array.<Unit>}
	 * The failed unit tests of this suite
	 */
	Suite.prototype.failed = function() {
		return this._failed;
	};

	/**
	 * Runs all of the unit tests registered to this suite, and returns whether
	 * they were successful
	 *
	 * @return {boolean}
	 * Whether the unit tests where successfully completed
	 */
	Suite.prototype.test = function() {
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
	// Initialize the TimeUnit constructor function
	//


	/**
	 * Constructs a new TimeUnit object which validates that the units of all
	 * of a set of Quantums are correct
	 *
	 * @param {string} name
	 * Name of this unit test
	 *
	 * @param {string} unit
	 * Method name which retrieves the value of the requsted unit
	 *
	 * @param {array.<number>} vals
	 * Expected values of the Quantums, in order
	 *
	 * @constructor
	 */
	function TimeUnit( name, unit, vals ) {
		Unit.call( this, name, this.run );
		this.unit = unit;
		this.vals = vals;
	}

	TimeUnit.prototype = new Unit();
	TimeUnit.prototype.constructor = TimeUnit;

	/**
	 * Utility method for appending failure messages to a string buffer
	 *
	 * @param {array.<string>} f
	 * String buffer to which to append the error message
	 *
	 * @param {Quantum} q
	 * Quantum which caused the exception
	 *
	 * @param {number} v
	 * Value returned from the comparison
	 *
	 * @param {number} e
	 * Expected value, which should have matched v but didn't
	 */
	TimeUnit.prototype.fail = function( f, q, v, e ) {
		f.push(( "Quantum(" + q + ") : " + v + " !== " + e ));
	};

	/**
	 * Unit testing method
	 *
	 * @param {QSuite} suite
	 * The unit testing suite calling this unit test
	 *
	 * @return {boolean}
	 * Whether this unit test passed successfully
	 */
	TimeUnit.prototype.run = function( suite ) {
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


	/**
	 * Base unit testing suite for QuantumSet
	 *
	 * @constructor
	 */
	function QSuite() {
		Suite.call( this );
	}

	QSuite.prototype = new Suite();
	QSuite.prototype.constructor = QSuite;

	/**
	 * Initializes the unit tests for this suite. This is typically only called
	 * once during construction, but can be called any time desired to
	 * re-initialize this suite.
	 */
	QSuite.prototype.init = function() {
		var tests;

		Suite.prototype.init.call( this );
		tests = this._tests;

		tests.push( new Unit( "Initial Set Length", function( suite ) {
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

		tests.push( new TimeUnit( "Validating Milliseconds", "millis", [
			198, 
			80545396, 
			21099, 
			235000359315, 
			12340
		]));

		tests.push( new TimeUnit( "Validating Seconds", "seconds", [
			( 198 / 1000 ),
			( 80545396 / 1000 ),
			( 21099 / 1000 ),
			( 235000359315 / 1000 ),
			( 12340 / 1000 )
		]));

		tests.push( new TimeUnit( "Validating Minutes", "minutes", [
			( 198 / ( 1000 * 60 )),
			( 80545396 / ( 1000 * 60 )),
			( 21099 / ( 1000 * 60 )),
			( 235000359315 / ( 1000 * 60 )),
			( 12340 / ( 1000 * 60 ))
		]));

		tests.push( new TimeUnit( "Validating Hours", "hours", [
			( 198 / ( 1000 * 60 * 60 )),
			( 80545396 / ( 1000 * 60 * 60 )),
			( 21099 / ( 1000 * 60 * 60 )),
			( 235000359315 / ( 1000 * 60 * 60 )),
			( 12340 / ( 1000 * 60 * 60 ))
		]));

		tests.push( new Unit( "compare( 1, 2 ) === false", function( suite ) {
			var q1, q2;

			q1 = new Q.Quantum( 1, 2 );
			q2 = new Q.Quantum( 2, 3 );

			return suite.set().compare( q1, q2 ) === false;
		}, "[ 1, 2 ] is greater than [ 2, 3 ]"));

		tests.push( new Unit( "compare( 2, 1 ) === true", function( suite ) {
			var q1, q2;

			q1 = new Q.Quantum( 2, 3 );
			q2 = new Q.Quantum( 1, 2 );

			return ( suite.set().compare( q1, q2 ) === true );
		}, "[ 2, 3 ] is less than [ 1, 2 ]"));

		tests.push( new Unit( "compare( 1, 1 ) === true", function( suite ) {
			var q1, q2;

			q1 = new Q.Quantum( 1, 2 );
			q2 = new Q.Quantum( 1, 3 );

			return ( suite.set().compare( q1, q2 ) === true );
		}, "[ 1, 2 ] is not equal to [ 1, 3 ]"));

		tests.push( new Unit( "Validating Monotonicity", function( suite ) {
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

		tests.push( new Unit( "Validating Intersections", function( suite ) {
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

					if ( set.intersects( q1, q2 ) !== v ) {
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

		tests.push( new Unit( "Validating the Merge Operation", function( suite ) {
			var s, b, q1, q2, q3, m1, m2, m3;

			this.emsg = "";
			s = suite.set();
			b = [];

			q1 = new Q.Quantum( 234, 432 );
			q2 = new Q.Quantum( 543, 2345 );
			q3 = new Q.Quantum( 123, 6789 );

			m1 = s.merge( q1, q2 );
			m2 = s.merge( q1, q3 );
			m3 = s.merge( q2, q3 );

			if ( m1.length !== 2 ) {
				b.push( q1 + " and " + q2 + " intersect: " + m1[ 0 ] );
			}

			if ( m2.length !== 1 ) {
				b.push( q1 + " and " + q2 + " do not intersect: [" + m2[ 0 ] + ", " + m2[ 1 ] + "]" );

			} else if (( m2[ 0 ].start !== 123 ) || ( m2[ 0 ].stop !== 6789 )) {
				b.push( "Invalid Merge: merge( " + q1 + ", " + q2 + " ) = " + m2[ 0 ] );
			}

			if ( m3.length !== 1 ) {
				b.push( q2 + " and " + q3 + " do not intersect: [" + m3[ 0 ] + ", " + m3[ 1 ] + "]" );

			} else if (( m3[ 0 ].start !== 123 ) || ( m3[ 0 ].stop !== 6789 )) {
				b.push( "Invalid Merge: merge( " + q2 + ", " + q3 + " ) = " + m3[ 0 ] );
			}

			if ( b.length !== 0 ) {
				this.emsg = b.join( ',\n' );
				return false;
			}

			return true;
		}));

		tests.push( new Unit( "Validating the Disjoint Operation", function( suite ) {
			var s, d, b;
			
			b = [];
			s = suite.set();
			d = s.disjoint();
			s.set( d ); //< Go ahead and set the disjoint set for further processing

			if ( d.length !== 3 ) {
				b.push( "Not disjoint: " + s );
				
			} else {
				if (( d[ 0 ].start !== 2 ) || ( d[ 0 ].stop !== 23421 )) {
					b.push( "Invalid first element: " + d[ 0 ] );
				}

				if (( d[ 1 ].start !== 2342933 ) || ( d[ 1 ].stop !== 82888329 )) {
					b.push( "Invalid second element: " + d[ 1 ] );
				}

				if (( d[ 2 ].start !== 3232123423 ) || ( d[ 2 ].stop !== 238232482738 )) {
					b.push( "Invalid third element: " + d[ 2 ] );
				}
			}

			if ( b.length !== 0 ) {
				this.emsg = b.join( ',\n' );
				return false;
			}

			return true;
		}));

		tests.push( new TimeUnit( "Checking Post-Disjoint Milliseconds", "millis", [
			( 23421 - 2 ),
			( 82888329 - 2342933 ),
			( 238232482738 - 3232123423 )
		]));
		
		tests.push( new TimeUnit( "Checking Post-Disjoint Seconds", "seconds", [
			(( 23421 - 2 ) / 1000 ),
			(( 82888329 - 2342933 ) / 1000 ),
			(( 238232482738 - 3232123423 ) / 1000 )
		]));
		
		tests.push( new TimeUnit( "Checking Post-Disjoint Minutes", "minutes", [
			(( 23421 - 2 ) / ( 1000 * 60 )),
			(( 82888329 - 2342933 ) / ( 1000 * 60 )),
			(( 238232482738 - 3232123423 ) / ( 1000 * 60 ))
		]));
		
		tests.push( new TimeUnit( "Checking Post-Disjoint Hours", "hours", [
			(( 23421 - 2 ) / ( 1000 * 60 * 60 )),
			(( 82888329 - 2342933 ) / ( 1000 * 60 * 60 )),
			(( 238232482738 - 3232123423 ) / ( 1000 * 60 * 60 ))
		]));
	};

	/**
	 * Resets the objects used in this unit testing suite
	 */
	QSuite.prototype.reset = function() {
		var set;

		Suite.prototype.reset.call( this );
		
		set = new Q.QuantumSet([
			new Q.Quantum( 123, 321 ),
			new Q.Quantum( 2342933, 82888329 ),
			new Q.Quantum( 2322, 23421 ),
			new Q.Quantum( 3232123423, 238232482738 ),
			new Q.Quantum( 2, 12342 )
		]);

		this._set = set;
	};

	/**
	 * Getter for the QuantumSet used in this suite
	 *
	 * @return {QuantumSet}
	 * The QuantumSet used in this suite
	 */
	QSuite.prototype.set = function() {
		return this._set;
	};


	//
	// Populate the namespace
	//


	Q.QSuite = QSuite;
	Q.Suite = Suite;
	Q.Unit = Unit;
}( Q ));

