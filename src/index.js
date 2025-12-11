export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const fileName = url.searchParams.get("file");

    if (!fileName) {
      return new Response("file parameter is required", { status: 400 });
    }

    const expiresIn = 60 * 60; // 1 hora

    // Genera el URL presigned para subir usando R2 nativo
    const signed = await env.MY_BUCKET.createPresignedUrl({
      key: fileName,
      method: "PUT",
      expiration: expiresIn,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    return Response.json({
      uploadUrl: signed,
      method: "PUT",
      expiresIn,
      fileName,
    });
  },
};
