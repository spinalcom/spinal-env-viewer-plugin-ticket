import {
  SpinalGraphService
} from 'spinal-env-viewer-graph-service';

import geographicService from "spinal-env-viewer-context-geographic-service";

import {
  groupManagerService
} from "spinal-env-viewer-plugin-group-manager-service";

import {
  BIM_OBJECT_TYPE
} from "spinal-env-viewer-plugin-forge/dist/Constants";


import {
  SELECTrelationList,
  isShownParam
} from "spinal-env-viewer-plugin-standard_button/js/utilities";


import {
  SERVICE_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
  SPINAL_TICKET_SERVICE_STEP_TYPE,
} from "spinal-service-ticket/dist/Constants";


let ItemColoredMap = new Map();
let BimElementsColor = new Map();

class ColorElementExtension {

  constructor() {}

  getIcon(nodeInfo, contextInfo) {
    return this._isColored(nodeInfo, contextInfo).then(isColored => {
      return isColored;
    })
  }

  restoreItem(nodeInfo, contextInfo) {
    this.getGroups(nodeInfo, contextInfo).then(res => {
      res.forEach(el => {
        let id = el.id;
        this._restoreGroup(contextInfo.id, id);
      })
    })
  }

  colorItem(nodeInfo, contextInfo) {
    this.getGroups(nodeInfo, contextInfo).then(res => {
      res.forEach(el => {
        let id = el.id;
        let color = el.color ? el.color : undefined;
        this._colorGroup(contextInfo.id, id, color);
      })
    })
  }

  getGroups(selectedNode, contextInfo) {
    const type = selectedNode.type;
    const nodeId = selectedNode.id;
    const contextId = contextInfo.id;

    if (type === SPINAL_TICKET_SERVICE_STEP_TYPE) {
      return Promise.resolve([selectedNode]);
    }

    return SpinalGraphService.findInContext(nodeId, contextId, (node) => {
      SpinalGraphService._addNode(node);
      let argType = node.getType().get();
      return argType === SPINAL_TICKET_SERVICE_STEP_TYPE
      //   return groupManagerService.isGroup(argType);
    }).then(res => {
      return res.map(el => {
        return el.get();
      })
    })
  }

  async getBimObjects(contextId, groupId) {
    const notes = await this._getTickets(groupId, contextId);
    const parents = await this._getParents(notes);

    const promises = parents.map(el => this._getItemsBim(el));

    return Promise.all(promises).then((result) => {
      const res = [];
      result.forEach(el => res.push(...el));
      return res;
    })
  }

  ////////////////////////////////////////////////////////////
  //                    PRIVATE                             //
  ////////////////////////////////////////////////////////////


  _isColored(selectedNode, contextInfo) {
    return this.getGroups(selectedNode, contextInfo).then(res => {

      if (res.length === 0) return false;

      for (let index = 0; index < res.length; index++) {
        const id = res[index].id;

        if (typeof ItemColoredMap.get(id) === "undefined") {
          return false;
        }

      }

      return true;

    })

  }

  _colorGroup(contextId, groupId, argColor) {

    return this.getBimObjects(contextId, groupId).then(res => {

      let color = typeof argColor !== "undefined" ? this
        ._convertHexColorToRGB(argColor) : this._convertHexColorToRGB(
          "#000000");

      ItemColoredMap.set(groupId, groupId);

      res.forEach(child => {
        let BimColors = BimElementsColor.get(child.dbid) ?
          BimElementsColor.get(child.dbid) : [];

        BimColors.push({
          id: groupId, //node.id,
          color: color
        });

        BimElementsColor.set(child.dbid, BimColors);

        let model = window.spinal.BimObjectService.getModelByBimfile(
          child.bimFileId);

        model.setThemingColor(child.dbid, new THREE.Vector4(
            color.r / 255, color.g / 255, color.b / 255, 0.7, true)

        );

      });

    })
  }

  _restoreGroup(contextId, groupId) {
    ItemColoredMap.delete(groupId);
    return this.getBimObjects(contextId, groupId).then(res => {
      res.forEach(child => {

        let model = window.spinal.BimObjectService.getModelByBimfile(
          child.bimFileId);

        model.setThemingColor(
          child.dbid,
          // eslint-disable-next-line no-undef
          new THREE.Vector4(0, 0, 0, 0),
          true
        );

        let allColors = BimElementsColor.get(child.dbid);

        if (allColors) {
          //   allColors = allColors.filter(el => el.id !== node.id.get());
          allColors = allColors.filter(el => el.id !== groupId);
          BimElementsColor.set(child.dbid, allColors);

          if (allColors.length > 0) {
            let color = allColors[0].color;
            model.setThemingColor(
              child.dbid,
              // eslint-disable-next-line no-undef
              new THREE.Vector4(
                color.r / 255,
                color.g / 255,
                color.b / 255,
                0.7
              ),
              true
            );
          }
        }
      })
    })
  }

  _getTickets(nodeId, contextId) {
    return SpinalGraphService.findInContext(nodeId, contextId, (node) => {
      SpinalGraphService._addNode(node);
      let argType = node.getType().get();
      return argType === SPINAL_TICKET_SERVICE_TICKET_TYPE;
    }).then(res => {
      return res.map(el => {
        return el.get();
      })
    })
  }

  _convertHexColorToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } :
      null;
  }

  _getParents(notes) {
    const promises = notes.map(async el => {
      const realNode = SpinalGraphService.getRealNode(el.id);
      const parents = await realNode.getParents(
        SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME);

      return parents
        .filter((el) => {
          return isShownParam.indexOf(el.getType().get()) !== -1;
        })
    });

    return Promise.all(promises).then((result) => {

      const res = [];

      result.forEach(element => {
        const infos = element.map(el => {
          SpinalGraphService._addNode(el);
          return el.info.get()
        });

        res.push(...infos);
      });

      return res;
    })

  }

  _getItemsBim(nodeInfo) {

    const type = nodeInfo.type;
    const nodeId = nodeInfo.id;

    if (type === BIM_OBJECT_TYPE) {
      return Promise.resolve([nodeInfo]);
    } else if (type === geographicService.constants
      .ROOM_TYPE) {
      return SpinalGraphService.getChildren(nodeId, [geographicService
        .constants
        .REFERENCE_RELATION, geographicService.constants
        .EQUIPMENT_RELATION
      ]);
    } else {
      // let relations = [
      //   ...geographicService.constants.GEOGRAPHIC_RELATIONS,
      //   geographicService.constants.REFERENCE_RELATION
      // ];

      return SpinalGraphService.findNodes(nodeId, SELECTrelationList, (
        node) => {
        return node.getType().get() === BIM_OBJECT_TYPE
      }).then(res => {
        return res.map(el => {
          SpinalGraphService._addNode(el);
          return el.info.get();
        })
      })
    }
  }

}


export default new ColorElementExtension()