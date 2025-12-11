export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const fileName = url.searchParams.get("file");

    if (!fileName) {
      return new Response("file parameter is required", { status: 400 });
    }

    // Build the Signed URL manually
    const expiresInSeconds = 3600; // 1 hour
    const expiration = Math.floor(Date.now() / 1000) + expiresInSeconds;

    const signedUrl = await env.MY_BUCKET.createSignedUrl({
      key: fileName,
      method: "PUT",
      expiration,
      headers: {
        "Content-Type": "application/octet-stream"
      }
    });

    return Response.json({
      uploadUrl: signedUrl,
      method: "PUT",
      expiresIn: expiresInSeconds,
      fileName
    });
  }
}
