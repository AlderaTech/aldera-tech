import { expect, it } from "bun:test";
const { summarizeWork, summarizeInvoices } =
  await import("./overview-distributions");

it("counts actual task/milestone statuses, including blocked and backlog", () => {
  expect(
    summarizeWork(
      [
        { status: "COMPLETED", _count: { _all: 3 } },
        { status: "BLOCKED", _count: { _all: 2 } },
      ],
      [
        { status: "DONE", _count: { _all: 1 } },
        { status: "REVIEW", _count: { _all: 2 } },
        { status: "BACKLOG", _count: { _all: 1 } },
      ]
    )
  ).toEqual({ completed: 4, active: 2, pending: 3 });
  expect(summarizeWork([], [])).toEqual({
    completed: 0,
    active: 0,
    pending: 0,
  });
});
it("excludes drafts and cancelled invoices from the issued invoice distribution", () => {
  expect(
    summarizeInvoices([
      { status: "DRAFT", _count: { _all: 100 } },
      { status: "CANCELLED", _count: { _all: 50 } },
      { status: "PAID", _count: { _all: 2 } },
      { status: "OVERDUE", _count: { _all: 1 } },
      { status: "PENDING_VERIFICATION", _count: { _all: 1 } },
    ])
  ).toEqual({ paid: 2, waiting: 1, verification: 1 });
});
