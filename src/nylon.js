var Nylon = (function( TWEEN ) {

    'use strict';

    var Nylon = {};

    /**
     * Converts our made-up rgb object into an "rgba()" string
     * @param  {object} c Object containing attributes in the format { r: <number>, g: <number>, b: <number>, opacity: <number> }
     * @return {string}   An "rgba()" string
     */
    var rgba = function( c ) {
        c.r = c.r || 0;
        c.g = c.g || 0;
        c.b = c.b || 0;
        c.opacity = c.opacity || 1;

        return [ 'rgba(', c.r, ', ', c.g, ', ', c.b, ', ', c.opacity, ')' ].join( '' );
    };

    /**
     * Generates a method which extends an object
     * @param  {object} Obj Parent object to generate extend method for
     * @return {function}   Method which will return an extended version of Obj
     *
     * Is this too insane?
     */
    var extend = function( Obj ) {
        return function( options ) {
            var obj = function( attributes ) {
                Obj.call( this, attributes );
            };

            obj.extend = extend( obj );

            // Old style
            obj.prototype = new Obj();
            obj.prototype.constructor = obj;

            // New style
            // shape.prototype = Object.create( Shape.prototype );

            for( var key in options )  {
                obj.prototype[ key ] = options[ key ];
            }

            return obj;
        };
    };

    /**
     * Tween properties using the TWEEN library
     *
     * @param {string} target (optional) The keyname of the property to animate
     * @param {object} destination The values to tween to
     * @param {float} duration The duration of the animation in msec, default is 1000
     * @param {Easing} easing The type of easing to use, default is Quadratic.InOut
     * @return {this} Returns the parent object for chaining.
     */
    var animate = function() {
        var args = Array.prototype.slice.call( arguments ),
            target,
            destination,
            duration,
            tween;

        if( typeof args[0] === 'object' ) {
            target = this.attributes;
        } else {
            target = this.attributes[ args.shift() ];
        }

        destination = args.shift();
        duration = args.shift();
        tween = args.shift();

        duration = duration || 1000;
        tween = tween || TWEEN.Easing.Quadratic.InOut;

        this.tween = new TWEEN.Tween( target )
            .to( destination , duration )
            .easing( tween )
            .start();

        return this;
    };

    /**
     * Wraps an object around canvas that holds elements and handle rendering
     * @param {dom} el A <canvas> element
     */
    var Canvas = function( options ) {
        var el;

        if( typeof options === 'object' ) {
            el = document.createElement( 'canvas' );
            el.setAttribute( 'width', options.width );
            el.setAttribute( 'height', options.height );
            document.getElementById( options.el ).appendChild( el );
        } else {
            el = document.getElementById( options );
        }

        this.el = el;
        this.ctx = el.getContext( '2d' );

        this.elements = [];
        this.attributes = {
            width: el.clientWidth,
            height: el.clientHeight
        };
    };

    Canvas.prototype = {
        add: function( element ) {
            this.elements.push( element ) ;
        },
        render: function() {
            this.ctx.clearRect( 0, 0, this.attributes.width, this.attributes.height ); // wipe entire canvas - inefficient.
            for(var i in this.elements ) {
                this.elements[ i ].render( this.ctx );
            }
        }
    };

    /**
     * A container of objects that allows composite positioning / animation
     * @param {object} attributes Positioning and rotational attributes in the format { x: <number>, y: <number>, rotate: <number> }
     * @param {[type]} elements   [description]
     */
    var Group = function( attributes, elements ) {
        this.elements = elements || [];
        this.attributes = { x: 0, y: 0, rotate: 0 };
        for( var key in attributes ) {
            this.attributes[ key ] = attributes[ key ];
        }
    };

    Group.prototype = {
        add: function( element ) {
            this.elements.push( element ) ;
        },
        render: function( ctx ) {
            var attr = this.attributes;

            ctx.save();

            ctx.translate( attr.x, attr.y );
            ctx.rotate( attr.rotate );

            for(var i in this.elements ) {
                this.elements[ i ].render( ctx );
            }

            ctx.restore();
        },
        animate: animate
    };

    /**
     * A shape primative
     * @param {object} attributes Object containing positions and styles:
     *                            { x: <number>, y: <number>, rotate: <number>, fill: <string>, stroke: <string> }
     */
    var Shape = function( attributes ) {
        attributes = attributes || {};
        this.attributes = attributes;
        this.initialize( attributes );
    };

    Shape.extend = extend( Shape );

    Shape.prototype = {
        initialize: function() {},
        draw: function( ctx ) { },
        render: function( ctx ) {
            var attr = this.attributes;

            ctx.save();

            if ( 'font' in attr ) {
                ctx.font = attr.font;
            }

            if ( 'fill' in attr ) {
                ctx.fillStyle = rgba( attr.fill );
            }

            if ( 'stroke' in attr ) {
                ctx.strokeStyle = rgba( attr.stroke );
            }

            if( 'lineWidth' in attr ) {
                ctx.lineWidth = attr.lineWidth;
            }

            ctx.beginPath();

            ctx.translate( attr.x, attr.y );
            ctx.rotate( attr.rotate );

            this.draw( ctx );

            ctx.restore();
        },
        animate: animate
    };

    /**
     * An Arc primitive shape
     * @param {object} attributes Object containing positions and styles:
     *                            { radius: <number>, angle: <number> }
     */
    var Arc = Shape.extend({
        initialize: function( attributes ) {
            this.attributes.rotate = ( 'rotate' in attributes ? attributes.rotate : 0 );
        },
        draw: function( ctx ) {
            var attr = this.attributes;
            ctx.arc(
                0,
                0,
                attr.radius,
                0,
                attr.angle,
                0
            );

            if ( 'fill' in attr ) {
                ctx.fill();
            }

            if ( 'stroke' in attr ) {
                ctx.stroke();
            }
        }
    });

    /**
     * A Circle primitive shape
     * @param {object} attributes Object containing positions and styles:
     *                            { radius: <number> }
     */
    var Circle = Shape.extend({
        draw: function( ctx ) {
            var attr = this.attributes;

            ctx.arc(
                0,
                0,
                attr.radius,
                0,
                2 * Math.PI,
                1
            );

            if ( 'fill' in attr ) {
                ctx.fill();
            }

            if ( 'stroke' in attr ) {
                ctx.stroke();
            }
        }
    });

    /**
     * A Label primitive
     * @param {object} attributes Object containing positions and styles:
     *                            { align: <string>, baseline: <string>, text: <string> }
     */
    var Label = Shape.extend({
        draw: function( ctx ) {
            var attr = this.attributes;

            ctx.textAlign = ( 'align' in attr ? attr.align : 'left' );
            ctx.textBaseline = ( 'baseline' in attr ? attr.baseline : 'bottom' );
            ctx.fillText( attr.text, 0, 0 );
        }
    });

    Nylon.Canvas = Canvas;
    Nylon.Group = Group;
    Nylon.Shape = Shape;
    Nylon.Arc = Arc;
    Nylon.Circle = Circle;
    Nylon.Label = Label;

    return Nylon;

})( TWEEN );