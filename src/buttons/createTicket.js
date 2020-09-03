import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";

import {
  spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

import {
  SERVICE_TYPE,
  SPINAL_TICKET_SERVICE_STEP_TYPE
} from "spinal-service-ticket/dist/Constants";

import {
  SpinalGraphService
} from "spinal-env-viewer-graph-service";

export class CreateTicket extends SpinalContextApp {
  constructor() {
    super("create ticket", "this button allows to create ticket", {
      icon: "receipt",
      icon_type: "in",
      backgroundColor: "#356BAB",
      fontColor: "#ffffff"
    })
  }

  isShown(option) {

    if (!option.selectedNode || !option.context) return Promise.resolve(true);

    const contextType = option.context.type.get();
    const stepType = option.selectedNode.type.get();

    const res = contextType !== SERVICE_TYPE && stepType !==
      SPINAL_TICKET_SERVICE_STEP_TYPE ?
      true : -1;

    return Promise.resolve(res);

  }

  action(option) {
    const realNode = SpinalGraphService.getRealNode(option.selectedNode.id
      .get());
    spinalPanelManagerService.openPanel("selectProcessDialog", {
      selectedNode: realNode
    });
  }

}