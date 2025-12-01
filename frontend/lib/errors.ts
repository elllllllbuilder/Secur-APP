export function getErrorMessage(err: any): string {
  // string direto
  if (typeof err === "string") return err;

  // axios: err.response.data.message
  const data = err?.response?.data ?? err?.data ?? err;

  // NestJS: message pode ser string OU array de strings
  if (data?.message !== undefined) {
    if (Array.isArray(data.message)) return data.message.join("\n");
    if (typeof data.message === "object") return JSON.stringify(data.message);
    return String(data.message);
  }

  // Pagar.me costuma vir em "errors"
  if (Array.isArray(data?.errors)) {
    const msgs = data.errors.map(
      (e: any) => e?.message || e?.parameter_name || JSON.stringify(e),
    );
    if (msgs.length) return msgs.join("\n");
  }

  // Fallbacks comuns
  if (typeof data === "object" && data !== null) {
    try {
      return JSON.stringify(data);
    } catch {}
  }
  return err?.message
    ? String(err.message)
    : "Não foi possível concluir a operação.";
}
