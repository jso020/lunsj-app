import { randomBytes } from "node:crypto";
import { Issuer, generators } from "openid-client";

function getBaseUrl(req) {
  return process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

export async function buildOidcClient() {
  const issuerUrl = process.env.OIDC_ISSUER;
  const clientId = process.env.OIDC_CLIENT_ID;
  const clientSecret = process.env.OIDC_CLIENT_SECRET;

  if (!issuerUrl || !clientId || !clientSecret) {
    throw new Error("Missing OIDC env vars (OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET)");
  }

  const issuer = await Issuer.discover(issuerUrl);
  return new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [process.env.OIDC_REDIRECT_URI || "http://localhost:3000/auth/callback"],
    response_types: ["code"]
  });
}

export async function startLogin(req, res, client) {
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  const state = randomBytes(16).toString("hex");

  req.session.codeVerifier = codeVerifier;
  req.session.state = state;

  const redirectUri = process.env.OIDC_REDIRECT_URI || `${getBaseUrl(req)}/auth/callback`;
  const authUrl = client.authorizationUrl({
    scope: "openid profile email",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    redirect_uri: redirectUri
  });

  res.redirect(authUrl);
}

export async function handleCallback(req, res, client) {
  const params = client.callbackParams(req);
  const redirectUri = process.env.OIDC_REDIRECT_URI || `${getBaseUrl(req)}/auth/callback`;

  const tokenSet = await client.callback(redirectUri, params, {
    code_verifier: req.session.codeVerifier,
    state: req.session.state
  });

  const claims = tokenSet.claims();
  const email = (claims.email || claims.preferred_username || "").toLowerCase();
  const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN || "computas.com").toLowerCase();

  if (!email.endsWith(`@${allowedDomain}`)) {
    req.session.user = null;
    return res.status(403).send(`Kun @${allowedDomain}-brukere er tillatt.`);
  }

  req.session.user = {
    email,
    name: claims.name || email
  };

  res.redirect("/");
}
