import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";


import {
  SERVICE_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
} from "spinal-service-ticket/dist/Constants";


import ColorElementExtension from "../../extensions/colorElementExtension";

export class ZoomElementOnMaquette extends SpinalContextApp {
  constructor() {
    super("Zoom", "Isolate object on maquette", {
      icon: "zoom_in",
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

    const dbIds = parents.map(el => el.ids)

    window.spinal.ForgeViewer.viewer.fitToView(dbIds.flat());

  }
}