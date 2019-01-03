import { spinalContextMenuService } from 'spinal-env-viewer-context-menu-service';
import { AddTypologyButton } from './AddTypology';
import { SpinalMountExtention } from 'spinal-env-viewer-panel-manager-service';
import vue from 'vue';
import AddTypologyModal from './vue/AddTypologyModal.vue';
import store from './store';

spinalContextMenuService.registerApp( 'GraphManagerTopBar', new AddTypologyButton() );
SpinalMountExtention.mount( {
  name: 'AddTypology',
  vueMountComponent: vue.extend(
    {
      store,
      render: h => h( AddTypologyModal ),
      methods: {
        opened( option ) {
          store.commit('toggleAddTypology');
          console.log( 'opened dialog', option );
        },
        removed( option ) {
          store.commit('toggleAddTypology');
          console.log( 'removed dialog', option );
        },
        closeDialog( closeResult ) {

        },
      },
    } ),
  parentContainer: document.body

} );
