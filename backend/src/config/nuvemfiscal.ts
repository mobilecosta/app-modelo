type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

const TOKEN_RENEW_MARGIN_MS = 60 * 1000;

const getEnv = (name: string): string | undefined => {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

export const getNuvemFiscalBaseUrl = (): string => {
  return getEnv('NUVEM_FISCAL_BASE_URL') ?? 'https://api.nuvemfiscal.com.br';
};

const getTokenEndpoint = (): string => {
  return getEnv('NUVEM_FISCAL_TOKEN_URL') ?? 'https://auth.nuvemfiscal.com.br/oauth/token';
};

export const getNuvemFiscalAccessToken = async (): Promise<string> => {
  const staticToken = getEnv('NUVEM_FISCAL_ACCESS_TOKEN');
  if (staticToken) {
    return staticToken;
  }

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + TOKEN_RENEW_MARGIN_MS) {
    return tokenCache.accessToken;
  }

  const clientId = getEnv('NUVEM_FISCAL_CLIENT_ID');
  const clientSecret = getEnv('NUVEM_FISCAL_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error(
      'Configure NUVEM_FISCAL_ACCESS_TOKEN ou NUVEM_FISCAL_CLIENT_ID/NUVEM_FISCAL_CLIENT_SECRET no backend/.env.'
    );
  }

  const scope = getEnv('NUVEM_FISCAL_SCOPE') ?? 'nfse';
  const form = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope
  });

  const response = await fetch(getTokenEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form.toString()
  });

  let body: Record<string, unknown> | null = null;
  try {
    body = await response.json() as Record<string, unknown>;
  } catch {
    body = null;
  }

  if (!response.ok || !body?.access_token || typeof body.access_token !== 'string') {
    const message =
      (body?.error_description as string | undefined) ??
      (body?.error as string | undefined) ??
      `Falha ao obter token da Nuvem Fiscal (HTTP ${response.status}).`;
    throw new Error(message);
  }

  const expiresInSeconds =
    typeof body.expires_in === 'number' && Number.isFinite(body.expires_in) ? body.expires_in : 3600;

  tokenCache = {
    accessToken: body.access_token,
    expiresAt: Date.now() + expiresInSeconds * 1000
  };

  return tokenCache.accessToken;
};
