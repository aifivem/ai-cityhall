import { PLACE_PED_SPEC, placePedFields } from "@aicore-fivem/lib/shared";
import type { PanelSchema } from "@aicore-fivem/shared";

const KEY = "^[a-z0-9_-]{2,48}$";

/** ai-cityhall's panel: city halls, jobs anyone may take, documents for sale. */
export const cityhallSchema: PanelSchema = {
  title: "ADMIN_TITLE",
  icon: "id-card",
  files: {
    halls: {
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
          fields: {
            sprite: { type: "number", min: 0, max: 1000, integer: true },
            color: { type: "number", min: 0, max: 100, integer: true },
            scale: { type: "number", min: 0.3, max: 2 },
          },
        },
      },
    },
    settings: {
      kind: "settings",
      sync: "admin",
      sections: {
        jobs: {
          type: "list",
          max: 30,
          of: {
            type: "object",
            fields: {
              job: {
                type: "text",
                lookup: "job",
                min: 2,
                max: 32,
                pattern: "^[a-z0-9_]{2,32}$",
              },
              grade: { type: "number", min: 0, max: 50, integer: true },
            },
          },
        },
        documents: {
          type: "list",
          max: 20,
          of: {
            type: "object",
            fields: {
              item: {
                type: "text",
                lookup: "item",
                min: 2,
                max: 48,
                pattern: KEY,
              },
              price: { type: "number", min: 0, max: 1_000_000, integer: true },
            },
          },
        },
        accounts: {
          type: "names",
          lookup: "account",
          max: 5,
          itemMax: 32,
          pattern: "^[a-z0-9_]{2,32}$",
        },
      },
    },
  },
  tabs: [
    {
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
    },
    {
      id: "settings",
      file: "settings",
      icon: "briefcase",
      label: "ADMIN_TAB_SETTINGS",
      desc: "ADMIN_TAB_SETTINGS_DESC",
      cards: [
        {
          icon: "briefcase",
          title: "ADMIN_C_JOBS",
          desc: "ADMIN_C_JOBS_DESC",
          fields: [
            {
              widget: "list",
              path: "jobs",
              label: "ADMIN_F_JOBS",
              addLabel: "ADMIN_ADD_JOB",
              max: 30,
              newRow: { job: "taxi", grade: 0 },
              rows: [
                {
                  widget: "text",
                  lookup: "job",
                  path: "job",
                  label: "ADMIN_F_JOB",
                  placeholder: "ADMIN_P_JOB",
                },
                {
                  widget: "number",
                  path: "grade",
                  label: "ADMIN_F_GRADE",
                  min: 0,
                  max: 50,
                },
              ],
            },
          ],
        },
        {
          icon: "id-card",
          title: "ADMIN_C_DOCS",
          desc: "ADMIN_C_DOCS_DESC",
          fields: [
            {
              widget: "list",
              path: "documents",
              label: "ADMIN_F_DOCS",
              addLabel: "ADMIN_ADD_DOC",
              max: 20,
              newRow: { item: "id_card", price: 50 },
              rows: [
                {
                  widget: "text",
                  lookup: "item",
                  path: "item",
                  label: "ADMIN_F_ITEM",
                  placeholder: "ADMIN_P_ITEM",
                },
                {
                  widget: "number",
                  path: "price",
                  label: "ADMIN_F_PRICE",
                  min: 0,
                  max: 1_000_000,
                  unit: "$",
                },
              ],
            },
            {
              widget: "tags",
              lookup: "account",
              path: "accounts",
              label: "ADMIN_F_ACCOUNTS",
              hint: "ADMIN_H_ACCOUNTS",
              placeholder: "ADMIN_P_ACCOUNTS",
            },
          ],
        },
      ],
    },
  ],
};
