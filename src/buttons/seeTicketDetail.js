import {
  SpinalContextApp
} from 'spinal-env-viewer-context-menu-service'

import {
  spinalPanelManagerService
} from 'spinal-env-viewer-panel-manager-service';

import {
  SERVICE_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_TYPE
} from "spinal-service-ticket/dist/Constants";

export class SeeTicketDetailButton extends SpinalContextApp {

  constructor() {
    super('See Ticket\' detail',
      'See ticket\'s detail', {
        icon: "assignment_late",
        icon_type: 'in',
        backgroundColor: "#356BAB",
        fontColor: '#ffffff'
      })
  }


  isShown(option) {
    const contextType = option.context.type.get();
    const nodeType = option.selectedNode.type.get();

    if (contextType === SERVICE_TYPE && nodeType ===
      SPINAL_TICKET_SERVICE_TICKET_TYPE) return Promise.resolve(true);
    return Promise.resolve(-1)
  }

  action(option) {
    const params = {
      selectedNode: option.selectedNode.get(),
      context: option.context.get()
    }
    spinalPanelManagerService.openPanel("ticketDetailDialog", params);
  }

}