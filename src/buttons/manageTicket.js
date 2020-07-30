import {
  SpinalContextApp
} from 'spinal-env-viewer-context-menu-service'

import {
  spinalPanelManagerService
} from 'spinal-env-viewer-panel-manager-service';

import {
  SERVICE_TYPE,
  SPINAL_TICKET_SERVICE_STEP_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_TYPE
} from "spinal-service-ticket/dist/Constants";

export class ManageTicketButton extends SpinalContextApp {

  constructor() {
    super('Manage Ticket',
      'Manage ticket', {
        icon: "assignment",
        icon_type: 'in',
        backgroundColor: "#356BAB",
        fontColor: '#ffffff'
      })
  }


  isShown(option) {
    const contextType = option.context.type.get();
    const nodeType = option.selectedNode.type.get();

    if (contextType !== SERVICE_TYPE) return Promise.resolve(-1);

    const displayIt = nodeType === SPINAL_TICKET_SERVICE_TICKET_TYPE ||
      nodeType === SPINAL_TICKET_SERVICE_STEP_TYPE;

    return Promise.resolve(displayIt ? true : -1);

  }

  action(option) {
    spinalPanelManagerService.openPanel("createTicketContextDialog")
  }

}