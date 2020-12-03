import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";


import {
  SERVICE_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
} from "spinal-service-ticket/dist/Constants";

import {
  SpinalGraphService
} from "spinal-env-viewer-graph-service";


import {
  SpinalContextSelectBIMObject,
} from "spinal-env-viewer-plugin-standard_button/js/selectBIMObjectButton";

import {
  SpinalContextFitToViewer
} from "spinal-env-viewer-plugin-standard_button/js/fitToViewerButton";

import {
  isShownParam
} from "spinal-env-viewer-plugin-standard_button/js/utilities";

import ColorElementExtension from "../../extensions/colorElementExtension";

export class SelectElementOnMaquette extends SpinalContextApp {
  constructor() {
    super("Select Object on Maquette", "select object on maquette", {
      icon: "find_in_page",
      icon_type: "in",
      backgroundColor: "#356BAB",
      fontColor: "#ffffff",
    });
  }

  isShown(option) {
    const contextType = option.context.type.get();
    const nodeType = option.selectedNode.type.get();

    if (
      contextType === SERVICE_TYPE
      // &&
      // nodeType === SPINAL_TICKET_SERVICE_TICKET_TYPE
    )
      return Promise.resolve(true);
    return Promise.resolve(-1);
  }

  async action(option) {
    const nodeId = option.selectedNode.id.get();
    const contextId = option.context.id.get();

    const parents = await ColorElementExtension.getTicketParentsBim(nodeId,
      contextId);


    if (!parents || (parents && parents.length === 0)) {
      window.alert("No parent on bimMaquette");
      return;
    }

    parents.forEach((el) => {
      el.model.selector.setSelection(el.ids, el.model, "selectOnly");
    })



    // const selectButton = new SpinalContextSelectBIMObject();
    // // const zoomButton = new SpinalContextFitToViewer();

    // parents.forEach((element) => {
    //   const params = {
    //     selectedNode: element,
    //   };
    //   selectButton.action(params);
    //   // zoomButton.action(params);
    // });
  }
}