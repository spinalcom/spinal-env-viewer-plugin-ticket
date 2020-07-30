import {
  SpinalContextApp
} from 'spinal-env-viewer-context-menu-service'

import {
  spinalPanelManagerService
} from 'spinal-env-viewer-panel-manager-service';

import {
  SERVICE_TYPE
} from "spinal-service-ticket/dist/Constants";

export class CreateProcess extends SpinalContextApp {

  constructor() {
    super('Create ticket Process',
      'This button allows you to create ticket processes', {
        icon: "category",
        icon_type: 'in',
        backgroundColor: "#356BAB",
        fontColor: '#ffffff'
      })
  }


  isShown(option) {
    const type = option.selectedNode.type.get();

    return Promise.resolve(type === SERVICE_TYPE ? true : -1);

  }

  action(option) {
    const contextId = option.context.id.get();

    spinalPanelManagerService.openPanel("createProcessDialog", {
      contextId
    })
  }

}