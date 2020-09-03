import {
  CreateContextButton
} from "./createContext";

import {
  CreateProcess
} from "./createProcess";

import {
  CreateStep
} from "./createStep";

import {
  CreateTicket
} from "./createTicket";

import {
  ManageTicketButton
} from "./manageTicket";

import {
  CreateCommonIncident
} from "./createCommonIncident";

import {
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";

import {
  SeeTicketDetailButton
} from './seeTicketDetail'

const HEADER_HOOK_NAME = "GraphManagerTopBar";
const SIDEBAR_HOOK_NAME = "GraphManagerSideBar";
const CIRCULAR_MENU_HOOK = 'circularMenu';


/* Headerbar Buttons*/
spinalContextMenuService.registerApp(HEADER_HOOK_NAME,
  new CreateContextButton(), [3]);


/* Sidebar Buttons*/
spinalContextMenuService.registerApp(SIDEBAR_HOOK_NAME,
  new ManageTicketButton(), [3]);

spinalContextMenuService.registerApp(SIDEBAR_HOOK_NAME,
  new CreateCommonIncident(), [3]);

spinalContextMenuService.registerApp(SIDEBAR_HOOK_NAME, new CreateProcess(), [
  3
]);

spinalContextMenuService.registerApp(SIDEBAR_HOOK_NAME, new CreateStep(), [
  3
]);

spinalContextMenuService.registerApp(SIDEBAR_HOOK_NAME, new CreateTicket(), [
  3
]);

// spinalContextMenuService.registerApp(SIDEBAR_HOOK_NAME, new CreateTicket(), [
//   3
// ]);

spinalContextMenuService.registerApp(SIDEBAR_HOOK_NAME,
  new SeeTicketDetailButton(), [
    3
  ]);

/* CircularMenu Buttons*/
spinalContextMenuService.registerApp(CIRCULAR_MENU_HOOK, new CreateTicket(), [
  3
]);