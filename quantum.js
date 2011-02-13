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

	var MS_PER_SEC, MS_PER_MIN, MS_PER_HR, MIN, MAX;
	MS_PER_SEC = 1000;             //< Milliseconds per second
	MS_PER_MIN = MS_PER_SEC * 60;  //< Milliseconds per minute
	MS_PER_HR  = MS_PER_MIN * 60;  //< Milliseconds per hour

	// Binary operation which determines the min/maximum value of two parameters
	MIN = Math.min;
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
	QuantumSet.prototype.intersects = function( q1, q2 ) {
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

		if ( this.intersects( q1, q2 )) {
			a = MIN( q1.start, q2.start );
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
	 * @param {boolean} mono
	 * Whether the elements in this QuantumSet have already been sorted
	 * monotonically
	 *
	 * @return {array.<Quantum>}
	 * A disjoint, monotone increasing set of Quantums
	 */
	QuantumSet.prototype.disjoint = function( mono ) {
		var set, $set, _set, q, i, k, n;
		set = (( !mono ) ?  this.monotonic() : this._set );
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
	// Populate the namespace
	//


	Q.Quantum = Quantum;
	Q.QuantumSet = QuantumSet;
}( Q ));

