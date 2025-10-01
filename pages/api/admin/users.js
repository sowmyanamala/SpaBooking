export default async function handler(req, res) {
  const PHP = "https://tsm.spagram.com/api/users.php";
  const { method, query } = req;

  if (method === "GET") {
    const url = `${PHP}?${new URLSearchParams({
      page: String(query.page || 1),
      limit: String(query.limit || 25),
      q: String(query.q || ""),
    })}`;
    const r = await fetch(url);
    const j = await r.json();
    return res.status(200).json(j); // {success, data, page, limit, total}
  }

  if (method === "PUT" || method === "DELETE") {
    const url = `${PHP}?id=${encodeURIComponent(query.id)}`;
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "PUT" ? JSON.stringify(req.body || {}) : undefined,
    });
    const j = await r.json();
    return res.status(r.ok ? 200 : 400).json(j);
  }

  res.setHeader("Allow", "GET,PUT,DELETE");
  res.status(405).end("Method Not Allowed");
}
