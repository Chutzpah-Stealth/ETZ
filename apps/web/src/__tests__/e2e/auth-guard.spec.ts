import { test, expect } from "@playwright/test";

/**
 * Guard de autenticação — rotas protegidas redirecionam para /login quando não autenticado.
 * Esses testes NÃO precisam de usuário real: apenas verificam que a rota é bloqueada.
 */
test.describe("Guard de autenticação (sem sessão)", () => {
  test("acesso direto a /dashboard redireciona para /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("acesso direto a /admin redireciona para /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("acesso direto a /admin/usuarios redireciona para /login", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await expect(page).toHaveURL(/\/login/);
  });

  test("página de login carrega e exibe formulário", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /senha/i })).toBeVisible();
  });

  test("login com credenciais inválidas exibe mensagem de erro", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("textbox", { name: /email/i }).fill("invalido@etz.com");
    await page.getByRole("textbox", { name: /senha/i }).fill("senhaerrada");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page.getByText(/inválid|incorret|erro|error/i)).toBeVisible({ timeout: 5000 });
  });
});
