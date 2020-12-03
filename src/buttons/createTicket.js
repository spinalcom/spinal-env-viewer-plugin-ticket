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
  SpinalGraphService,
  SpinalNode
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

  async action(option) {
    let info = option.selectedNode;

    if (typeof info === "undefined")
      info = await createBimObjectNode(option);

    const realNode = getSelectedNode(info);

    // manageTicketPanel

    spinalPanelManagerService.openPanel("manageTicketPanel", {
      selectedNode: realNode
    });
  }

}


const getSelectedNode = (selectedNode) => {
  if (typeof selectedNode === "undefined") return;

  if (selectedNode instanceof SpinalNode)
    return selectedNode;

  return SpinalGraphService.getRealNode(selectedNode.id.get());
}


const createBimObjectNode = (params) => {

  const viewer = spinal.ForgeViewer.viewer;

  // const aggregateSelection = viewer.getAggregateSelection()[0];


  if (typeof params.dbid !== "undefined" && params.model3d) {
    const dbid = params.dbid;
    const model = params.model3d;


    return new Promise((resolve) => {
      viewer.model.getProperties(dbid, async res => {
        const node = await window.spinal.BimObjectService
          .createBIMObject(dbid, res.name, model)
        resolve(node);
      })

    });
  }
}