export const ADMIN_EMAIL = "lmodirv@gmail.com";
export const isAdminEmail = (email?: string | null) =>
  !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
