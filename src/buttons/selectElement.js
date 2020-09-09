import { SpinalContextApp } from "spinal-env-viewer-context-menu-service";

import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";

import {
  SERVICE_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
  SPINAL_TICKET_SERVICE_STEP_TYPE,
} from "spinal-service-ticket/dist/Constants";

import { SpinalGraphService } from "spinal-env-viewer-graph-service";

import { GEOGRAPHIC_TYPES_ORDER } from "spinal-env-viewer-context-geographic-service/build/constants";

import { SpinalContextSelectBIMObject } from "spinal-env-viewer-plugin-standard_button/js/selectBIMObjectButton";

import { isShownParam } from "spinal-env-viewer-plugin-standard_button/js/utilities";

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
      contextType === SERVICE_TYPE &&
      nodeType === SPINAL_TICKET_SERVICE_TICKET_TYPE
    )
      return Promise.resolve(true);
    return Promise.resolve(-1);
  }

  async action(option) {
    const ticketId = option.selectedNode.id.get();
    const parents = await getGeographicElement(ticketId);

    if (!parents || (parents && parents.length === 0)) {
      window.alert("No parent on bimMaquette");
      return;
    }

    const button = new SpinalContextSelectBIMObject();

    parents.forEach((element) => {
      const params = {
        selectedNode: element,
      };
      button.action(params);
    });
  }
}

const getGeographicElement = async (ticketId) => {
  //   const parents = await SpinalGraphService.getParents(ticketId, [
  //     SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
  //   ]);

  const realNode = SpinalGraphService.getRealNode(ticketId);
  const parents = await realNode.getParents(
    SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME
  );

  return parents
    .filter((el) => {
      SpinalGraphService._addNode(el);
      return isShownParam.indexOf(el.getType().get()) !== -1;
    })
    .map((el) => el.info);
};
