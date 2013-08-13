var Nylon = (function( TWEEN ) {

    var Nylon = {};

    var rgba = function( c ) {
        c.r = c.r || 0;
        c.g = c.g || 0;
        c.b = c.b || 0;
        c.opacity = c.opacity || 1;

        return [ 'rgba(', c.r, ', ', c.g, ', ', c.b, ', ', c.opacity, ')' ].join( '' );
    }


    // Is this too insane?
    var Extend = function( Obj ) {
        return function( options ) {
            var obj = function( attributes ) {
                Obj.call( this, attributes );
            };

            obj.extend = Extend( obj );

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

    var Animate = function( attributes, duration, tween ) {
        var args = Array.prototype.slice.call( arguments ),
            target,
            attributes,
            duration,
            tween;

        if( typeof args[0] === 'object' ) {
            target = this.attributes;
        } else {
            target = this.attributes[ args.shift() ];
        }

        attributes = args.shift();
        duration = args.shift();
        tween = args.shift();

        duration = duration || 1000;
        tween = tween || TWEEN.Easing.Quadratic.InOut;

        this.tween = new TWEEN.Tween( target )
            .to( attributes , duration )
            .easing( tween )
            .start();

        return this;
    };

    var Canvas = function( el ) {
        this.el = el;
        this.ctx = el.getContext( '2d' );
        this.elements = [];
    };

    Canvas.prototype = {
        add: function( element ) {
            this.elements.push( element ) ;
        },
        render: function() {
            this.ctx.clearRect( 0, 0, 1000, 1000 ); // wipe entire canvas - inefficient.
            for(var i in this.elements ) {
                this.elements[ i ].render( this.ctx );
            }
        }
    };

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
        animate: Animate
    };

    var Shape = function( attributes ) {
        attributes = attributes || {};
        this.attributes = attributes;
        this.initialize( attributes );
    };

    Shape.extend = Extend( Shape );

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
            this.draw( ctx );

            ctx.restore();
        },
        animate: Animate
    };

    var Arc = Shape.extend({
        initialize: function( attributes ) {
            this.attributes.rotate = ( 'rotate' in attributes ? attributes.rotate : 0 );
        },
        draw: function( ctx ) {
            var attr = this.attributes;
            ctx.arc(
                attr.x,
                attr.y,
                attr.radius,
                attr.rotate,
                attr.rotate + attr.angle,
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

    var Circle = Shape.extend({
        draw: function( ctx ) {
            var attr = this.attributes;

            ctx.arc(
                attr.x,
                attr.y,
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

    var Label = Shape.extend({
        draw: function( ctx ) {
            var attr = this.attributes;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText( attr.text, attr.x, attr.y );
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