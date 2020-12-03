import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";

import {
  spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

import {
  SERVICE_TYPE,
  PROCESS_TYPE
} from "spinal-service-ticket/dist/Constants";

export class CreateStep extends SpinalContextApp {
  constructor() {
    super("create ticket step", "this button allows to create ticket step", {
      icon: "post_add",
      icon_type: "in",
      backgroundColor: "#356BAB",
      fontColor: "#ffffff"
    })
  }

  isShown(option) {
    const contextType = option.context.type.get();
    const processType = option.selectedNode.type.get();

    const res = contextType === SERVICE_TYPE && processType === PROCESS_TYPE ?
      true : -1;

    return Promise.resolve(res);

  }

  action(option) {
    const contextId = option.context.id.get();
    const processId = option.selectedNode.id.get();

    spinalPanelManagerService.openPanel("createStepDialog", {
      contextId,
      processId
    });
  }

}