// src/services/pkce.ts
// (Copiado do seu arquivo 'pkce.ts')

// Gera o code_verifier (string aleatória)
export const generateCodeVerifier = (length = 64): string => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Gera o code_challenge (para o método 'plain', é o mesmo que o verifier)
export const generateCodeChallenge = (verifier: string): string => {
  return verifier;
};
