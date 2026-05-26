import { test, expect, type Page } from "@playwright/test";

/**
 * Fluxos do painel admin — requerem superadmin autenticado.
 * Configura: PLAYWRIGHT_ADMIN_EMAIL e PLAYWRIGHT_ADMIN_PASSWORD nas variáveis de ambiente.
 *
 * Executar: PLAYWRIGHT_ADMIN_EMAIL=admin@etz.com PLAYWRIGHT_ADMIN_PASSWORD=senha pnpm test:e2e
 */

const ADMIN_EMAIL    = process.env.PLAYWRIGHT_ADMIN_EMAIL    ?? "";
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? "";

test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, "PLAYWRIGHT_ADMIN_EMAIL e PLAYWRIGHT_ADMIN_PASSWORD não configurados");

async function loginAsSuperadmin(page: Page) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: /email/i }).fill(ADMIN_EMAIL);
  await page.getByRole("textbox", { name: /senha/i }).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /entrar/i }).click();
  await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
}

test.describe("Painel Admin — superadmin autenticado", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperadmin(page);
  });

  test("superadmin é redirecionado de /dashboard para /admin", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/admin/, { timeout: 5000 });
  });

  test("visão geral exibe 4 cards de estatísticas", async ({ page }) => {
    await expect(page.getByText("Usuários")).toBeVisible();
    await expect(page.getByText("Ativos")).toBeVisible();
    await expect(page.getByText("Instituições")).toBeVisible();
    await expect(page.getByText("Unidades")).toBeVisible();
  });

  test("sidebar exibe links de navegação do admin", async ({ page }) => {
    await expect(page.getByRole("link", { name: /usuários/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /instituições/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /auditoria/i })).toBeVisible();
  });

  test("página de usuários carrega tabela", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await expect(page.getByRole("table")).toBeVisible({ timeout: 8000 });
  });

  test("botão Novo Usuário abre modal com campo Instituição", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await page.getByRole("button", { name: /novo usuário/i }).click();
    await expect(page.getByLabel(/instituição/i)).toBeVisible();
  });

  test("campo Papel só aparece após selecionar instituição", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await page.getByRole("button", { name: /novo usuário/i }).click();

    // Antes de selecionar instituição — Papel não visível
    await expect(page.getByLabel(/papel/i)).not.toBeVisible();
  });

  test("página de instituições exibe botão Nova Instituição", async ({ page }) => {
    await page.goto("/admin/instituicoes");
    await expect(page.getByRole("button", { name: /nova instituição/i })).toBeVisible();
  });

  test("modal Nova Instituição exibe campo Produto", async ({ page }) => {
    await page.goto("/admin/instituicoes");
    await page.getByRole("button", { name: /nova instituição/i }).click();
    await expect(page.getByLabel(/produto/i)).toBeVisible();
  });

  test("página de auditoria exibe coluna ID do Registro", async ({ page }) => {
    await page.goto("/admin/auditoria");
    await expect(page.getByText("ID do Registro")).toBeVisible({ timeout: 8000 });
  });

  test("coluna Alvo não aparece em nenhuma página admin", async ({ page }) => {
    for (const path of ["/admin", "/admin/auditoria"]) {
      await page.goto(path);
      await expect(page.getByRole("columnheader", { name: /^alvo$/i })).not.toBeVisible();
    }
  });
});
