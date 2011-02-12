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

;( function( Q ) {

	var SECONDS, MINUTES, HOURS, max;
	SECONDS = 1000;          //< Milliseconds per second
	MINUTES = SECONDS * 60;  //< Milliseconds per minute
	HOURS   = MINUTES * 60;  //< Milliseconds per hour

	// Binary operation which determines the maximum value of two parameters
	max = Math.max;

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
	 * The ratio of the difference between stop and start and HOURS
	 */
	Quantum.prototype.hours = function() {
		return this.millis() / HOURS;
	};

	/**
	 * Number of minutes contained within this quantum
	 *
	 * @return {number}
	 * The ratio of the difference between stop and start and MINUTES
	 */
	Quantum.prototype.minutes = function() {
		return this.millis() / MINUTES;
	};

	/**
	 * Number of seconds contained within this quantum
	 *
	 * @return {number}
	 * The ratio of the difference between stop and start and SECONDS
	 */
	Quantum.prototype.seconds = function() {
		return this.millis() / SECONDS;
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
	 * Constructs a new Quantum set which includes some handy utility methods
	 * 
	 * @param {array.<Quantum>} args
	 * An array of Quantums to add to this set
	 *
	 * @constructor
	 */
	function QuantumSet( args ) {
		var set = [];
		
		if ( args ) {
			set.push( args );
		}

		this._set = set;
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
		this._set.push( args );
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
		return this._set.sort(( compare || this.compare ));
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
		var q1a, q1B, q2a;
		q1a = q1.start;
		q1B = q1.stop;
		q2a = q2.start;

		return (( q1a <= q2a ) && ( q1B >= q2a ));
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
			B = max( q1.stop, q2.stop );
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

		if ( ! monotonic ) {
			this._set = this.monotonic();
		}

		set = this._set;
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
		return this.millis() / HOURS;
	};

	/**
	 * Calculates and returns the number of minutes of all the Quantums in this
	 * QuantumSet
	 *
	 * @return {number}
	 * Number of minutes of all the Quantums in this QuantumSet
	 */
	QuantumSet.prototype.minutes = function() {
		return this.millis() / MINUTES;
	};

	/**
	 * Calculates and returns the number of seconds of all the Quantums in this
	 * QuantumSet
	 *
	 * @return {number}
	 * Number of seconds of all the Quantums in this QuantumSet
	 */
	QuantumSet.prototype.seconds = function() {
		return this.millis() / SECONDS;
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

	//
	// Populate the namespace
	//
	
	Q.Quantum = Quantum;
	Q.QuantumSet = QuantumSet;
}( Q ));

