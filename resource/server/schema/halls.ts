import {
  BLIP_STYLE_FIELDS,
  PLACE_PED_SPEC,
  placePedFields,
} from "@aicore-fivem/lib/shared";
import type { FileSpec, TabSpec } from "@aicore-fivem/shared";

export const hallsFile: FileSpec = {
  kind: "records",
  sync: "all",
  labelPath: "label",
  newRecord: {
    label: "City Hall",
    coords: { x: 0, y: 0, z: 0 },
    radius: 2.5,
    blip: true,
  },
  sections: {
    ped: PLACE_PED_SPEC,
    label: { type: "text", min: 1, max: 48 },
    coords: { type: "vec3" },
    radius: { type: "number", min: 1, max: 20 },
    blip: { type: "bool" },
    blipStyle: {
      type: "object",
      optional: true,
      fields: BLIP_STYLE_FIELDS,
    },
  },
};

export const hallsTab: TabSpec = {
  id: "halls",
  file: "halls",
  icon: "location-dot",
  label: "ADMIN_TAB_HALLS",
  desc: "ADMIN_TAB_HALLS_DESC",
  createLabel: "ADMIN_NEW_HALL",
  deleteLabel: "ADMIN_DELETE_HALL",
  cards: [
    {
      icon: "location-dot",
      title: "ADMIN_C_HALL",
      desc: "ADMIN_C_HALL_DESC",
      fields: [
        {
          widget: "text",
          path: "label",
          suggest: { from: "coords" },
          label: "ADMIN_F_LABEL",
          placeholder: "ADMIN_P_LABEL",
        },
        {
          widget: "point",
          path: "coords",
          label: "ADMIN_F_COORDS",
          hint: "ADMIN_H_COORDS",
          ground: true,
        },
        {
          widget: "number",
          path: "radius",
          label: "ADMIN_F_RADIUS",
          min: 1,
          max: 20,
          unit: "m",
        },
        { widget: "switch", path: "blip", label: "ADMIN_F_BLIP" },
        {
          widget: "blip",
          path: "blipStyle",
          label: "ADMIN_F_BLIP_STYLE",
          showIf: { path: "blip", values: [true] },
        },
      ],
    },
    {
      icon: "user",
      title: "ADMIN_C_PED",
      desc: "ADMIN_C_PED_DESC",
      fields: placePedFields(),
    },
  ],
};
