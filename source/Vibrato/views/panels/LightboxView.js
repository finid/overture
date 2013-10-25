// -------------------------------------------------------------------------- \\
// File: LightboxView.js                                                      \\
// Module: PanelViews                                                         \\
// Requires: Core, Foundation, DOM, View                                      \\
// Author: Neil Jenkins                                                       \\
// License: © 2010–2013 Opera Software ASA. All rights reserved.              \\
// -------------------------------------------------------------------------- \\

/*global location*/

"use strict";

( function ( NS ) {

var canTransform = !!NS.UA.cssProps.transform,
    canTransform3d = !!NS.UA.cssProps.transform3d;

var LightboxItemView = NS.Class({

    Extends: NS.View,

    Mixin: NS.AnimatableView,

    lightbox: null,
    index: 0,
    activeIndex: -1,

    frameThickness: 30,
    margin: 76,

    position: function () {
        return this.get( 'index' ) - this.get( 'activeIndex' );
    }.property( 'activeIndex' ),

    isActive: NS.bind( 'lightbox.isActive', null, NS.Transform.toBoolean ),
    hideControls: true,

    className: function () {
        return 'LightboxItemView' +
            ( this.get( 'hideControls' ) ? ' hideControls' : '' );
    }.property( 'hideControls' ),

    positioning: 'absolute',

    draw: function ( layer, Element, el ) {
        return [
            this.renderContent(),
            this._close = el( 'a.close', { href: location.href }, [
                el( 'span.navLink', [ NS.loc( 'Close' ) ] )
            ])
        ];
    },

    updateDrawProperties: function () {
        var position = this.get( 'position' ),
            layout =
                !position ?
                    this.get( 'isActive' ) ? 'centreLayout' : 'thumbLayout' :
                position > 0 ?
                    'rightLayout' : 'leftLayout';

        this.set( 'animateLayerDuration', layout === 'thumbLayout' ? 350: 500 )
            .set( 'hideControls', !!position )
            .set( 'layout', this.get( layout ) );
    }.observes( 'isActive', 'position', 'dimensions' ),

    // --- Animation ---

    didAnimate: function () {
        this.increment( 'animating', -1 );
        if ( !this.get( 'position' ) && !this.get( 'isActive' ) ) {
            var lightbox = this.get( 'lightbox' );
            if ( lightbox ) {
                lightbox.removeFromDocument();
            }
        }
    },

    // --- Layout ---

    thumbPosition: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },

    contentDimensions: {
        width: 300,
        height: 300
    },

    didEnterDocument: function () {
        // Must flush CSS changes -> force reflow/redraw.
        if ( !this.get( 'position' ) ) {
            this.get( 'layer' ).getBoundingClientRect();
        }
        return LightboxItemView.parent.didEnterDocument.call( this );
    },

    parentViewDidResize: function () {
        this.computedPropertyDidChange( 'dimensions' );
    },

    dimensions: function () {
        var content = this.get( 'contentDimensions' ),
            width = content.width,
            height = content.height,
            frame = this.get( 'frameThickness' ),
            margin = this.get( 'margin' ),

            lightbox = this.get( 'lightbox' ),
            lightboxWidth = lightbox.get( 'pxWidth' ),
            lightboxHeight = lightbox.get( 'pxHeight' ),

            maxWidth = Math.min( width, lightboxWidth - frame - margin ),
            maxHeight = Math.min( height, lightboxHeight - frame - margin ),

            ratio = Math.max( width / maxWidth, height / maxHeight );

        if ( ratio !== 1 ) {
            width = parseInt( width / ratio, 10 );
            height = parseInt( height / ratio, 10 );
        }

        return {
            canvasWidth: lightboxWidth,
            canvasHeight: lightboxHeight,

            width: width,
            height: height
        };
    }.property( 'contentDimensions', 'frameThickness' ),

    thumbLayout: function () {
        var dimensions = this.get( 'dimensions' ),
            width = dimensions.width,
            height = dimensions.height,
            frame = this.get( 'frameThickness' ),
            thumb = this.get( 'thumbPosition' ),
            left = Math.floor( thumb.left +
                ( thumb.right - thumb.left - width - frame ) / 2 ),
            top = Math.floor( thumb.top +
                ( thumb.bottom - thumb.top - height - frame ) / 2 ),
            scale = ( thumb.right - thumb.left ) / ( width + frame ),
            layout = canTransform ? {
                width: width,
                height: height,
                transform:
                    ( canTransform3d ?
                    'translate3d(' + left + 'px,' + top + 'px,0) ' :
                    'translate(' + left + 'px,' + top + 'px) '
                    ) +
                    'scale(' + scale + ')'
            } : {
                top: top,
                left: left,
                width: width * scale,
                heigh: height * scale
            };

        return layout;
    }.property( 'dimensions', 'thumbPosition' ),

    centreLayout: function () {
        var dimensions = this.get( 'dimensions' ),
            width = dimensions.width,
            height = dimensions.height,
            frame = this.get( 'frameThickness' ),
            left = ( dimensions.canvasWidth - width - frame ) >> 1,
            top = ( dimensions.canvasHeight - height - frame ) >> 1,
            layout = canTransform ? {
                width: width,
                height: height,
                transform:
                    ( canTransform3d ?
                    'translate3d(' + left + 'px,' + top + 'px,0) ' :
                    'translate(' + left + 'px,' + top + 'px) '
                    ) +
                    'scale(1)'
            } : {
                top: top,
                left: left,
                width: width,
                heigh: height
            };

        return layout;
    }.property( 'dimensions' ),

    leftLayout: function () {
        var dimensions = this.get( 'dimensions' ),
            width = dimensions.width,
            height = dimensions.height,
            frame = this.get( 'frameThickness' ),
            left = -( width + frame ),
            top = ( dimensions.canvasHeight - height - frame ) >> 1,
            scale = 0.5,
            layout = canTransform ? {
                width: width,
                height: height,
                transform:
                    ( canTransform3d ?
                    'translate3d(' + left + 'px,' + top + 'px,0) ' :
                    'translate(' + left + 'px,' + top + 'px) '
                    ) +
                    'scale(' + scale + ')'
            } : {
                top: top,
                left: left,
                width: width * scale,
                heigh: height * scale
            };

        return layout;
    }.property( 'dimensions' ),

    rightLayout: function () {
        var dimensions = this.get( 'dimensions' ),
            width = dimensions.width,
            height = dimensions.height,
            frame = this.get( 'frameThickness' ),
            left = dimensions.canvasWidth,
            top = ( dimensions.canvasHeight - height - frame ) >> 1,
            scale = 0.5,
            layout = canTransform ? {
                width: width,
                height: height,
                transform:
                    ( canTransform3d ?
                    'translate3d(' + left + 'px,' + top + 'px,0) ' :
                    'translate(' + left + 'px,' + top + 'px) '
                    ) +
                    'scale(' + scale + ')'
            } : {
                top: top,
                left: left,
                width: width * scale,
                heigh: height * scale
            };

        return layout;
    }.property( 'dimensions' ),

    // --- Event handling ---

    close: function () {
        this.get( 'lightbox' ).close();
    },

    onClick: function ( event ) {
        if ( NS.Element.contains( this._close, event.target ) ) {
            event.preventDefault();
            this.close();
        }
        event.stopPropagation();
    }.on( 'click' )
});

var LightboxPhotoView = NS.Class({

    Extends: LightboxItemView,

    className: function () {
        return 'LightboxItemView LightboxPhotoView' +
            ( this.get( 'hideControls' ) ? ' hideControls' : '' );
    }.property( 'hideControls' ),

    didAnimate: function () {
        LightboxPhotoView.parent.didAnimate.call( this );
        if ( this._highResShowing && this.get( 'position' ) ) {
            this.switchToLowRes();
        }
    },

    thumbImage: function () {
        return NS.Element.create( 'img', {
            src: this.get( 'imgThumb' ).src,
            alt: ''
        });
    }.property(),

    getSrcForWidth: function ( width ) {
        var src = this.get( 'imgSrc' );
        return src + ( src.indexOf( '?' ) > -1 ? '&' : '?' ) +
            'width=' + width;
    },

    _highResShowing: false,

    highResLoaded: false,

    highResImage: function () {
        var img = NS.Element.create( 'img', { alt: '' } );
        img.onload = function () {
            this.set( 'highResLoaded', true );
            img = img.onload = null;
        }.invokeInRunLoop().bind( this );
        img.src =
            this.getSrcForWidth( this.get( 'centreLayout' ).width );
        return img;
    }.property(),

    switchToHighRes: function () {
        if ( this.get( 'isRendered' ) &&
                !this.get( 'position' ) &&
                !this._highResShowing ) {
            var img = this.get( 'highResImage' );
            if ( this.get( 'highResLoaded' ) ) {
                this.get( 'layer' ).replaceChild(
                    img, this.get( 'thumbImage' ) );
                this._highResShowing = true;
            }
        }
    }.queue( 'render' ).observes( 'position', 'highResLoaded' ),

    switchToLowRes: function () {
        this.get( 'layer' ).replaceChild(
            this.get( 'thumbImage' ), this.get( 'highResImage' ) );
        this._highResShowing = false;
    }.queue( 'render' ),

    renderContent: function () {
        if ( !this.get( 'position' ) ) {
            this.get( 'highResImage' );
        }
        return this.get( 'thumbImage' );
    },

    // --- Layout ---

    thumbPosition: function () {
        return this.get( 'imgThumb' ).getBoundingClientRect();
    }.property(),

    contentDimensions: function () {
        return {
            width: this.get( 'imgWidth' ),
            height: this.get( 'imgHeight' )
        };
    }.property()
});

var LightboxView = NS.Class({

    Extends: NS.View,

    isActive: false,

    init: function ( parentView, mixin ) {
        LightboxView.parent.init.call( this, mixin );
        this._rootView = parentView;
        this._shortcuts = NS.ViewEventsController.kbShortcuts;
    },

    index: function ( index ) {
        index = index ? index.mod( this.get( 'total' ) ) : 0;
        this.get( 'childViews' ).forEach( function ( view ) {
            view.set( 'activeIndex', index );
        });
        return index;
    }.property(),

    total: 0,

    className: function () {
        return 'LightboxView' +
            ( this.get( 'isActive' ) ? ' active' : '' ) +
            ( this.get( 'total' ) < 2 ? ' hideControls' : '' );
    }.property( 'isActive', 'total' ),

    positioning: 'absolute',
    layout: NS.View.LAYOUT_FILL_PARENT,

    draw: function ( layer, Element, el ) {
        return [
            el( 'div.background' ),
            el( 'a.prev.navLink', { href: location.href }, [
                NS.loc( 'Previous' )
            ]),
            el( 'a.next.navLink', { href: location.href }, [
                NS.loc( 'Next' )
            ]),
            LightboxView.parent.draw.call( this, layer, Element, el )
        ];
    },

    // add/remove

    add: function ( view, activeIndex ) {
        this.increment( 'total', 1 );

        if ( activeIndex !== undefined ) {
            this.set( 'index', activeIndex );
        }

        view.set( 'lightbox', this )
            .set( 'index', this.get( 'total' ) - 1 )
            .set( 'activeIndex', this.get( 'index' ) );

        this.insertView( view );
    },

    remove: function ( view ) {
        this.removeView( view )
            .increment( 'total', -1 )
            .increment( 'index', 0 );
    },

    // Open/close

    open: function ( lightboxViews, startIndex ) {
        // Get list of item views.
        if ( !( lightboxViews instanceof Array ) ) {
            lightboxViews = [ lightboxViews ];
        }

        // Set index/total
        this.set( 'total', lightboxViews.length )
            .set( 'index', startIndex || ( startIndex = 0 ) );

        var l = lightboxViews.length,
            view;
        while ( l-- ) {
            view = lightboxViews[l];
            view.set( 'lightbox', this )
                .set( 'index', l )
                .set( 'activeIndex', startIndex );

            this.insertView( view );
        }

        // Disable keyboard shortcuts
        this._kbEnabled = this._shortcuts.get( 'isEnabled' );
        this._shortcuts.set( 'isEnabled', false );

        // Insert view
        this._rootView.insertView( this );

        // Capture events
        NS.ViewEventsController.addEventTarget(
            this.get( 'eventHandler' ), 10 );

        // Now, fade in gradient background and views.
        this.set( 'isActive', true );
    },

    close: function () {
        // Reenable keyboard shortcuts
        this._shortcuts.set( 'isEnabled', this._kbEnabled );

        // Stop capturing events
        NS.ViewEventsController.removeEventTarget( this.get( 'eventHandler' ) );

        // Fade out gradient background and views.
        // Item view will call removeFromDocument after animation.
        this.set( 'isActive', false );
    },

    removeFromDocument: function () {
        this._rootView.removeView( this );

        var children = this.get( 'childViews' ),
            l = children.length,
            view;

        while ( l-- ) {
            view = children[l];
            this.removeView( view );
            view.set( 'lightbox', null );
        }
    }.queue( 'render' ),

    // Dimensions

    pxWidth: function () {
        return this._rootView.get( 'pxWidth' );
    }.property().nocache(),

    pxHeight: function () {
        return this._rootView.get( 'pxHeight' );
    }.property().nocache(),

    // Actions

    eventHandler: function () {
        return new NS.ModalEventHandler({ view: this });
    }.property(),

    clickedOutside: function () {
        this.close();
    },

    keyOutside: function ( event ) {
        if ( event.type === 'keydown' ) {
            this.keyboardShortcuts( event );
        }
    },

    keyboardShortcuts: function ( event ) {
        switch ( NS.DOMEvent.lookupKey( event ) ) {
            case 'esc':
                this.close();
                break;
            case 'right':
                event.preventDefault();
                this.increment( 'index', 1 );
                break;
            case 'left':
                event.preventDefault();
                this.increment( 'index', -1 );
                break;
        }
        event.stopPropagation();
    }.on( 'keydown' ),

    onClick: function ( event ) {
        if ( event.button || event.metaKey || event.ctrlKey ) { return; }
        var action = event.target.className;
        if ( /prev/.test( action ) ) {
            this.increment( 'index', -1 );
        } else if ( /next/.test( action ) ) {
            this.increment( 'index', 1 );
        } else {
            this.close();
        }
        event.preventDefault();
        event.stopPropagation();
    }.on( 'click' )
});

NS.LightboxItemView = LightboxItemView;
NS.LightboxPhotoView = LightboxPhotoView;
NS.LightboxView = LightboxView;

}( this.O ) );
