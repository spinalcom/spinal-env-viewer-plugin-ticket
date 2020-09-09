import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";

import {
  spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

import {
  SERVICE_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
  SPINAL_TICKET_SERVICE_STEP_TYPE,
} from "spinal-service-ticket/dist/Constants";

import {
  SpinalGraphService
} from "spinal-env-viewer-graph-service";

import {
  isShownParam
} from "spinal-env-viewer-plugin-standard_button/js/utilities";

import colorExtension from "../extensions/colorElementExtension";

export class ColorElementButton extends SpinalContextApp {
  constructor() {
    super("Select Object on Maquette", "select object on maquette", {
      icon: "",
      icon_type: "in",
      backgroundColor: "#356BAB",
      fontColor: "#ffffff",
    });
  }

  isShown(option) {
    const contextType = option.context.type.get();
    const nodeType = option.selectedNode.type.get();

    if (
      contextType !== SERVICE_TYPE ||
      nodeType === SPINAL_TICKET_SERVICE_TICKET_TYPE
    )
      return Promise.resolve(-1);

    return colorExtension.getIcon(option.selectedNode.get(), option.context
        .get())
      .then(
        (isColored) => {
          this.buttonCfg["isColored"] = isColored;
          this.buttonCfg.icon = isColored ? "visibility_off" : "visibility";
          return true;
        })

  }

  async action(option) {
    const selected = option.selectedNode.get();
    const context = option.context.get();

    if (this.isColored) {
      this.icon = "visibility";
      this.isColored = false;
      colorExtension.restoreItem(selected, context);
    } else {
      this.icon = "visibility_off";
      this.isColored = true;
      colorExtension.colorItem(selected, context);
    }

    window.NOP_VIEWER.impl.invalidate(0, 1, 0);
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