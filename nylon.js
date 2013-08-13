var Nylon = (function() {

    var Nylon = {};

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
            this.ctx.clearRect( 0, 0, 500, 500 ); // wipe entire canvas - inefficient.
            for(var i in this.elements ) {
                this.elements[ i ].render( this.ctx );
            }
        }
    };

    var Group = function( elements ) {
        this.elements = elements || [];
    };

    Group.prototype = {
        add: function( element ) {
            this.elements.push( element ) ;
        },
        render: function( ctx ) {
            for(var i in this.elements ) {
                this.elements[ i ].render( ctx );
            }
        }
    };

    var Shape = function( attributes ) {
        attributes = attributes || {};
        this.attributes = attributes;
        this.attributes.rotate = ( 'rotate' in attributes ? attributes.rotate : 0 );
    };

    Shape.prototype = {
        render: function( ctx ) {
            var attr = this.attributes;

            ctx.moveTo( this.x, this.y );
            ctx.beginPath();

            this.draw( ctx );

            if ( 'fill' in attr ) {
                var pFill = ctx.fillStyle;
                ctx.fillStyle = attr.fill;
                ctx.fill();
                ctx.fillStyle = pFill;
            }

            if ( 'stroke' in attr ) {
                var pStroke = ctx.strokeStyle,
                    pWidth = ctx.lineWidth;

                if( 'lineWidth' in attr ) {
                    ctx.lineWidth = attr.lineWidth;
                }

                ctx.strokeStyle = attr.stroke;
                ctx.stroke();

                ctx.lineWidth = pWidth;
                ctx.strokeStyle = pStroke;
            }
        },
        draw: function( ctx ) { }
    };

    var Arc = function( attributes ) {
        Shape.call( this, attributes );
    };

    Arc.prototype = new Shape();
    Arc.prototype.constructor = Arc;

    Arc.prototype.draw = function( ctx ) {
        var attr = this.attributes;

        ctx.arc(
            attr.x,
            attr.y,
            attr.radius,
            attr.rotate,
            attr.rotate + attr.angle,
            0
        );
    };

    var Circle = function( attributes ) {
        Shape.call( this, attributes );
    };

    Circle.prototype = new Shape();
    Circle.prototype.constructor = Circle;

    Circle.prototype.draw = function( ctx ) {
        var attr = this.attributes;

        ctx.arc(
            attr.x,
            attr.y,
            attr.radius,
            0,
            2 * Math.PI,
            1
        );
    };

    Nylon.Canvas = Canvas;
    Nylon.Group = Group;
    Nylon.Shape = Shape;
    Nylon.Arc = Arc;
    Nylon.Circle = Circle;

    return Nylon;

})();