import type { FileSpec, TabSpec } from "@aicore-fivem/shared";

const KEY = "^[a-z0-9_-]{2,48}$";

export const settingsFile: FileSpec = {
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
    cardSeconds: { type: "number", min: 2, max: 60, integer: true },
  },
  defaults: { cardSeconds: 8 },
};

export const settingsTab: TabSpec = {
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
        {
          widget: "number",
          path: "cardSeconds",
          label: "ADMIN_F_CARD_SECONDS",
          hint: "ADMIN_H_CARD_SECONDS",
          min: 2,
          max: 60,
          unit: "s",
        },
      ],
    },
  ],
};
