// -------------------------------------------------------------------------- \\
// File: ListItemView.js                                                      \\
// Module: View                                                               \\
// Requires: Core, Foundation, DOM, View.js                                   \\
// Author: Neil Jenkins                                                       \\
// License: © 2010–2013 Opera Software ASA. All rights reserved.              \\
// -------------------------------------------------------------------------- \\

"use strict";

( function ( NS ) {

var ListItemView = NS.Class({

    Extends: NS.View,

    content: null,

    index: 0,
    itemHeight: 32,

    selectionController: null,
    isSelected: false,

    init: function ( mixin ) {
        var selectionController = mixin.selectionController,
            content = mixin.content;
        if ( selectionController && content ) {
            this.isSelected = selectionController.isIdSelected(
                content.get( 'id' )
            );
        }
        ListItemView.parent.init.call( this, mixin );
    },

    className: function () {
        return 'ListItemView' +
            ( this.get( 'isSelected' ) ? ' selected' : '' );
    }.property( 'isSelected' ),

    positioning: 'absolute',

    layout: function () {
        var index = this.get( 'index' ),
            itemHeight = this.get( 'itemHeight' );
        return  {
            top: index * itemHeight
        };
    }.property( 'index', 'itemHeight' )
});

NS.ListItemView = ListItemView;

}( this.O ) );