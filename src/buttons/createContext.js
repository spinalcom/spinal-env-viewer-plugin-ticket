import {
  SpinalContextApp
} from 'spinal-env-viewer-context-menu-service'

import {
  spinalPanelManagerService
} from 'spinal-env-viewer-panel-manager-service';


export class CreateContextButton extends SpinalContextApp {

  constructor() {
    super('Create Ticket context',
      'This button allows you to create ticket context', {
        icon: "receipt",
        icon_type: 'in',
        backgroundColor: "#356BAB",
        fontColor: '#ffffff'
      })
  }


  isShown(option) {
    return Promise.resolve(true);
  }

  action(option) {
    spinalPanelManagerService.openPanel("createTicketContextDialog")
  }

}