/*
 * Copyright 2019 SpinalCom - www.spinalcom.com
 *
 *  This file is part of SpinalCore.
 *
 *  Please read all of the following terms and conditions
 *  of the Free Software license Agreement ("Agreement")
 *  carefully.
 *
 *  This Agreement is a legally binding contract between
 *  the Licensee (as defined below) and SpinalCom that
 *  sets forth the terms and conditions that govern your
 *  use of the Program. By installing and/or using the
 *  Program, you agree to abide by all the terms and
 *  conditions stated or referenced herein.
 *
 *  If you do not agree to abide by these terms and
 *  conditions, do not demonstrate your acceptance and do
 *  not install or use the Program.
 *  You should have received a copy of the license along
 *  with this file. If not, see
 *  <http://resources.spinalcom.com/licenses.pdf>.
 */

import { SpinalContextApp } from 'spinal-env-viewer-context-menu-service';
import GeographicContextService
  from "spinal-env-viewer-context-geographic-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";


export class generateQR extends SpinalContextApp {

  constructor() {
    super( 'Generate QrCode', 'Qrcode', {
      icon: 'streetview',
      icon_type: 'in',
      backgroundColor: '#000000',
    } );
  }

  isShown( option ) {

    console.log( option );
    if (option.selectedNode.type.get() === GeographicContextService.constants.CONTEXT_TYPE) {
      return Promise.resolve( true );
    } else {
      return Promise.resolve( -1 );
    }
  }

  action( option ) {
    const nodes = SpinalGraphService.getNodes();

    for (const id in nodes) {
      if (nodes.hasOwnProperty( id )) {
        const node = nodes[id];
  
        if (node.info.type.get() === GeographicContextService.constants.ROOM_TYPE) {
          const qrcode = SpinalGraphService.generateQRcode( id );
          const qrNode = SpinalGraphService.createNode( { qrcode } );
    
          /*this.createContext()
            .then( contextId => {
              if (contextId) {
                console.log( contextId );
                SpinalGraphService.addChildInContext( id, qrNode, contextId, 'hasQRCode', 'Ref' );
              }
           }
           );*/
    
          console.log( qrNode );
        }
      }
  
    }
  }
  
  getContext() {
    return SpinalGraphService
      .getChildren( SpinalGraphService.getGraph().id.get(), ['hasContext'] )
      .then( children => {
        for (let i = 0; i < children.length; i++) {
          if (children[i].name.get() === 'Qrcode') {
            return Promise.resolve( children[i] );
          }
        }
        return Promise.resolve();
      } );
  }
  
  createContext() {
    return this.getContext()
      .then( context => {
        if (typeof context === 'undefined') {
          SpinalGraphService.addContext( 'QrCode' ).then(
            context => {
              return Promise.resolve( context.info.id.get() );
            }
          );
        }
        return Promise.resolve( context.id.get() );
      } );
  }
}
