export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const fileName = url.searchParams.get("file");

    if (!fileName) {
      return new Response("file parameter is required", { status: 400 });
    }

    const endpoint = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com`;

    const expiresIn = 3600;
    const expiration = Math.floor(Date.now() / 1000) + expiresIn;

    const canonicalUrl = `${endpoint}/${env.BUCKET_NAME}/${fileName}`;

    const stringToSign = `${canonicalUrl}:${expiration}`;
    const signature = await sign(stringToSign, env.SECRET_KEY);

    const signedUrl = `${canonicalUrl}?exp=${expiration}&sig=${signature}`;

    return Response.json({
      uploadUrl: signedUrl,
      method: "PUT",
      expiresIn,
      fileName
    });
  }
};

// HMAC SHA256 signer
async function sign(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
