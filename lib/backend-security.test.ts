import { describe, it, expect, mock } from "bun:test";
import type { Role } from "@prisma/client";
import { getTestPrisma } from "@/lib/test-prisma";
import { queryRouter } from "@/lib/router-db";
const prisma = getTestPrisma();
let session: {
  user: { id: string; role: Role; roles: Role[]; email: string; name: string };
} | null = null;
mock.module("server-only", () => ({}));
let failurePoint: "comment" | "transaction" | null = null;
const actionPrisma = new Proxy(prisma, {
  get(target, key) {
    if (key === "$transaction" && failurePoint === "transaction")
      return async () => {
        throw new Error("test transaction failure");
      };
    if (key === "blogComment" && failurePoint === "comment")
      return {
        ...target.blogComment,
        delete: async () => {
          throw new Error("test write failure");
        },
      };
    return Reflect.get(target, key);
  },
});
mock.module("@/lib/prisma", () => ({
  prisma: actionPrisma,
  default: actionPrisma,
}));
mock.module("@/auth", () => ({
  auth: async () => session,
  signIn: async () => {},
  signOut: async () => {},
}));
mock.module("next/cache", () => ({ revalidatePath: () => {} }));
mock.module("next/headers", () => ({
  headers: async () => new Headers(),
  cookies: async () => ({ get: () => undefined, set: () => {} }),
}));
mock.module("@/lib/notifications", () => ({
  notify: async () => ({ success: true }),
}));
mock.module("@/lib/whatsapp", () => ({
  sendWhatsApp: async () => ({ success: true }),
}));
const { consumeVerificationCode, issueVerificationCode } =
  await import("./verification-store");
const { resetPasswordAction, requestPasswordResetAction } =
  await import("./actions/password-reset");
const { updateProfile } = await import("./actions/profile");
const { submitOrderRequest } = await import("./actions/calculator");
const { convertProposalToProjectAction } = await import("./actions/proposal");
const { deleteProjectAction } = await import("./actions/project");
const {
  togglePublishBlogPostAction,
  deleteBlogCommentAction,
  toggleBlogReactionAction,
} = await import("./actions/blog");
const { createTaskAction } = await import("./actions/task");
const { postMessageAction } = await import("./actions/message");
const { ensureRouterUser, executePlaygroundChat } =
  await import("./actions/ai-relay");
const { createPaymentMethodAction } = await import("./actions/telegram-bot");
const { canReadFile } = await import("./file-download");

async function account(role: Role = "CLIENT") {
  const id = crypto.randomUUID();
  const user = await prisma.user.create({
    data: {
      id,
      email: `${id}@security.test`,
      name: "Regression account",
      password: "fake-hash",
      phone: `62813${Date.now().toString().slice(-8)}`,
      phoneVerified: new Date(),
      roles: [role],
    },
  });
  session = {
    user: { id, email: user.email, name: user.name, role, roles: [role] },
  };
  return user;
}
function form(values: Record<string, string>) {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

describe("Backend audit regressions: ownership, validation and concurrency", () => {
  it("caps parallel OTP attempts at five and serializes resend cooldown", async () => {
    const user = await account();
    const issued = await issueVerificationCode(user.phone!, user.id);
    expect(issued.ok).toBe(true);
    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        consumeVerificationCode(user.phone!, "000000")
      )
    );
    expect(results.every((r) => !r.ok)).toBe(true);
    const token = await prisma.verificationToken.findFirstOrThrow({
      where: { subjectUserId: user.id },
    });
    expect(token.attempts).toBe(5);
    expect((await consumeVerificationCode(user.phone!, token.token)).ok).toBe(
      false
    );
    const resends = await Promise.all([
      issueVerificationCode(user.phone!, user.id),
      issueVerificationCode(user.phone!, user.id),
    ]);
    expect(resends.every((r) => !r.ok)).toBe(true);
    await prisma.verificationToken.update({
      where: { id: token.id },
      data: { createdAt: new Date(Date.now() - 61000) },
    });
    const next = await Promise.all([
      issueVerificationCode(user.phone!, user.id),
      issueVerificationCode(user.phone!, user.id),
    ]);
    expect(next.filter((r) => r.ok)).toHaveLength(1);
  });

  it("consumes a reset token once and revokes all prior sessions/reset links", async () => {
    const user = await account();
    const token = crypto.randomUUID().replaceAll("-", "").repeat(2);
    await prisma.passwordResetToken.createMany({
      data: [token, token + "other"].map((token) => ({
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60000),
      })),
    });
    const fd = form({
      token,
      password: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    });
    const results = await Promise.all([
      resetPasswordAction({ ok: false }, fd),
      resetPasswordAction({ ok: false }, fd),
    ]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
        .securityVersion
    ).toBe(1);
    expect(
      await prisma.passwordResetToken.count({
        where: { userId: user.id, usedAt: null },
      })
    ).toBe(0);
  });

  it("normalizes changed phones, clears verification, rejects duplicates and invalid phones", async () => {
    const first = await account();
    const user = await account();
    expect(
      (await updateProfile(form({ name: user.name, phone: "not-a-phone" }))).ok
    ).toBe(false);
    expect(
      (await updateProfile(form({ name: user.name, phone: first.phone! }))).ok
    ).toBe(false);
    const result = await updateProfile(
      form({ name: user.name, phone: "081234567899" })
    );
    expect(result.ok).toBe(true);
    const saved = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(saved.phone).toBe("6281234567899");
    expect(saved.phoneVerified).toBeNull();
    await requestPasswordResetAction(
      { ok: false },
      form({ email: user.email })
    );
    expect(
      await prisma.passwordResetToken.count({ where: { userId: user.id } })
    ).toBe(0);
  });

  it("rejects cross-project relations before writing tasks or replies", async () => {
    const user = await account("ADMIN");
    const one = await prisma.project.create({
      data: { title: "One", description: "One", clientId: user.id },
    });
    const two = await prisma.project.create({
      data: { title: "Two", description: "Two", clientId: user.id },
    });
    const milestone = await prisma.milestone.create({
      data: { projectId: two.id, title: "Other milestone", order: 0 },
    });
    const parent = await prisma.projectMessage.create({
      data: { projectId: two.id, authorId: user.id, content: "Other message" },
    });
    const result = await createTaskAction(
      one.id,
      { ok: false },
      form({ title: "Cross project", milestoneId: milestone.id })
    );
    expect(result.ok).toBe(false);
    expect(
      (
        await postMessageAction(
          one.id,
          form({ content: "Reply", parentId: parent.id })
        )
      ).ok
    ).toBe(false);
    expect(await prisma.task.count({ where: { projectId: one.id } })).toBe(0);
  });

  it("denies destructive/publishing actions to developers", async () => {
    await account("DEVELOPER");
    await expect(deleteProjectAction("unreachable")).rejects.toThrow(
      "Forbidden"
    );
    await expect(convertProposalToProjectAction("unreachable")).rejects.toThrow(
      "Forbidden"
    );
    await expect(togglePublishBlogPostAction("unreachable")).rejects.toThrow(
      "Forbidden"
    );
    await expect(ensureRouterUser("another-user")).rejects.toThrow("Forbidden");
  });

  it("converts a proposal once and returns one-time access only for the new invited client", async () => {
    const admin = await account("ADMIN");
    const proposal = await prisma.proposal.create({
      data: {
        number: crypto.randomUUID(),
        token: crypto.randomUUID(),
        title: "Conversion",
        content: "Content",
        status: "SIGNED",
        clientName: "Invited Client",
        clientEmail: `${crypto.randomUUID()}@invite.test`,
        createdById: admin.id,
        totalAmount: 100000,
      },
    });
    const results = await Promise.all([
      convertProposalToProjectAction(proposal.id),
      convertProposalToProjectAction(proposal.id),
    ]);
    expect(new Set(results.map((r) => r.projectId)).size).toBe(1);
    expect(results.filter((r) => r.credentials)).toHaveLength(1);
    const client = await prisma.user.findUniqueOrThrow({
      where: { email: proposal.clientEmail },
    });
    expect(client.invitedAt).not.toBeNull();
    expect(client.phoneVerified).toBeNull();
  });

  it("rejects negative scale, inactive types and options belonging to another type", async () => {
    await account();
    const type = await prisma.projectType.create({
      data: {
        name: "Type",
        slug: crypto.randomUUID(),
        basePrice: 1000000,
        dependentFields: [{ label: "Pages", pricePerUnit: 100000 }],
      },
    });
    const other = await prisma.projectType.create({
      data: { name: "Other", slug: crypto.randomUUID(), basePrice: 1000000 },
    });
    const feature = await prisma.featureOption.create({
      data: { name: "Other feature", price: 100000, projectTypeId: other.id },
    });
    const input = {
      projectTypeId: type.id,
      features: [],
      customFeatures: [],
      addOns: [],
      dependentValues: { Pages: 1 },
      urgency: "normal",
    };
    await expect(
      submitOrderRequest({ ...input, dependentValues: { Pages: -60 } })
    ).rejects.toThrow();
    await expect(
      submitOrderRequest({ ...input, features: [feature.id] })
    ).rejects.toThrow("fitur");
    await prisma.projectType.update({
      where: { id: type.id },
      data: { active: false },
    });
    await expect(submitOrderRequest(input)).rejects.toThrow("Tipe proyek");
  });

  it("does not debit the wallet or fabricate output on upstream failure", async () => {
    const user = await account();
    const router = await ensureRouterUser(user.id);
    const model = `regression-${crypto.randomUUID()}`;
    await queryRouter(
      "INSERT INTO model_pricing (model_name, display_name, input_price_per_m, output_price_per_m, is_active) VALUES ($1,'Fixture model',1000,2000,true)",
      [model]
    );
    await queryRouter("UPDATE users SET balance=1000 WHERE id=$1", [router.id]);
    const saved = globalThis.fetch;
    globalThis.fetch = mock(
      async () => new Response("unavailable", { status: 503 })
    ) as typeof fetch;
    try {
      await expect(
        executePlaygroundChat({ model, prompt: "Hello" })
      ).rejects.toThrow("Saldo tidak dipotong");
    } finally {
      globalThis.fetch = saved;
    }
    expect(
      (
        await queryRouter<{ balance: string }>(
          "SELECT balance FROM users WHERE id=$1",
          [router.id]
        )
      ).rows[0].balance
    ).toBe("1000.0000");
    expect(
      (
        await queryRouter<{ n: string }>(
          "SELECT count(*) AS n FROM usage_logs WHERE user_id=$1",
          [router.id]
        )
      ).rows[0].n
    ).toBe("0");
    // Restore the seed so other ledger invariant tests remain meaningful.
    await queryRouter("UPDATE users SET balance=0 WHERE id=$1", [router.id]);
  });

  it("never claims a blog deletion/reaction succeeded when persistence fails", async () => {
    const user = await account();
    const post = await prisma.blogPost.create({
      data: {
        title: "Post",
        slug: crypto.randomUUID(),
        content: "Text",
        published: true,
        authorId: user.id,
      },
    });
    const comment = await prisma.blogComment.create({
      data: { postId: post.id, userId: user.id, content: "Comment" },
    });
    failurePoint = "comment";
    try {
      await expect(deleteBlogCommentAction(comment.id)).rejects.toThrow(
        "test write failure"
      );
    } finally {
      failurePoint = null;
    }
    expect(await prisma.blogComment.count({ where: { id: comment.id } })).toBe(
      1
    );
    failurePoint = "transaction";
    try {
      await expect(toggleBlogReactionAction(post.id, "LIKE")).rejects.toThrow(
        "test transaction failure"
      );
    } finally {
      failurePoint = null;
    }
  });

  it("keeps private proofs restricted to the invoice owner and public media readable", async () => {
    const owner = await account();
    const invoice = await prisma.invoice.create({
      data: {
        number: crypto.randomUUID(),
        clientId: owner.id,
        total: 1000,
        subtotal: 1000,
        issueDate: new Date(),
        dueDate: new Date(),
      },
    });
    const file = await prisma.file.create({
      data: {
        filename: "proof.pdf",
        originalName: "proof.pdf",
        path: "proof.pdf",
        url: "/private-proof",
        scope: "INVOICE_PROOF",
        invoiceId: invoice.id,
        uploaderId: owner.id,
        size: 10,
        mimeType: "application/pdf",
      },
    });
    expect(await canReadFile(file, null)).toBe(false);
    expect(await canReadFile(file, { id: owner.id, roles: ["CLIENT"] })).toBe(
      true
    );
    expect(await canReadFile(file, { id: "other", roles: ["DEVELOPER"] })).toBe(
      false
    );
    expect(await canReadFile({ ...file, scope: "PUBLIC_MEDIA" }, null)).toBe(
      true
    );
  });

  it("aborts a bot settings mutation before router writes if primary persistence fails", async () => {
    await account("ADMIN");
    failurePoint = "transaction";
    try {
      await expect(
        createPaymentMethodAction({ name: "Not saved", type: "BANK_TRANSFER" })
      ).rejects.toThrow("test transaction failure");
    } finally {
      failurePoint = null;
    }
    expect(
      (
        await queryRouter<{ n: string }>(
          "SELECT count(*) AS n FROM payment_method_settings WHERE name='Not saved'"
        )
      ).rows[0].n
    ).toBe("0");
  });
});
