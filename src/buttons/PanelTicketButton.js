/*
 * Copyright 2019 SpinalCom - www.spinalcom.com
 *
 *  This file is part of SpinalCore.
 *
 *  Please read all of the following terms and conditions
 *  of the Free Software license Agreement ("Agreement")
 *  carefully.
 *
 *  This Agreement is a legally binding contract between
 *  the Licensee (as defined below) and SpinalCom that
 *  sets forth the terms and conditions that govern your
 *  use of the Program. By installing and/or using the
 *  Program, you agree to abide by all the terms and
 *  conditions stated or referenced herein.
 *
 *  If you do not agree to abide by these terms and
 *  conditions, do not demonstrate your acceptance and do
 *  not install or use the Program.
 *  You should have received a copy of the license along
 *  with this file. If not, see
 *  <http://resources.spinalcom.com/licenses.pdf>.
 */

import aComponent from '../vue/PanelTicket.vue';
import Vue from 'vue';

const {
  SpinalContextApp
} = require("spinal-env-viewer-context-menu-service");
const {
  spinalPanelManagerService
} = require("spinal-env-viewer-panel-manager-service")
const {
  SpinalForgeExtention
} = require("spinal-env-viewer-panel-manager-service_spinalforgeextention");


class TiketPanelBtn extends SpinalContextApp {
  constructor() {
    super("Panel Ticket", "This button show ticket list", {
      icon: "event",
      icon_type: "in",
      backgroundColor: "#FF0000",
      fontColor: "#FFFFFF"
    });
  }

  isShown(option) {
      return Promise.resolve(true);
  }

  action(option) {
      spinalPanelManagerService.openPanel("TiketPanel", option);
    }
}

const extensionTiketPanel = SpinalForgeExtention.createExtention({
  name: "TiketPanel",
  vueMountComponent: Vue.extend(aComponent),
   toolbar: {
   icon: "event",
   label: "Ticket Panel",
   subToolbarName: "spinalcom"
  },
  panel: {
    title: "Panel Ticket",
    classname: "spinal-pannel",
    closeBehaviour: "hide"
  },
  style: {
    left: "405px",
     height: "259px",
     width: "16px"
  },
  onload: () => {},
  onUnLoad: () => {}
});

SpinalForgeExtention.registerExtention("TicketPanel", extensionTiketPanel);

export { TiketPanelBtn };