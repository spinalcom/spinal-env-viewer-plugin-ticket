/*
 * Copyright 2024 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";


import {
  SERVICE_TYPE,
} from "spinal-service-ticket/dist/Constants";

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
    spinal.ForgeViewer.viewer.impl.selector.setAggregateSelection(parents);
  }
}