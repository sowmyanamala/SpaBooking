import services from "../../../components/data/services";

export default async function handler(req, res) {
  const { method, query, body } = req;

  if (method === "GET") {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 25;
    const search = String(query.q || "").toLowerCase();

    // Filter services based on search query
    let filteredServices = services;
    if (search) {
      filteredServices = services.filter(
        (service) =>
          service.name.toLowerCase().includes(search) ||
          service.id.toLowerCase().includes(search)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedServices = filteredServices.slice(startIndex, endIndex);

    return res.status(200).json({
      success: 1,
      data: paginatedServices,
      page: page,
      limit: limit,
      total: filteredServices.length,
      message: "Services loaded successfully",
    });
  }

  if (method === "POST") {
    const { name } = body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: 0,
        message: "Service name is required",
      });
    }

    const newService = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name: name.trim(),
    };

    // In a real app, you'd save to database here
    // For now, we'll just return the new service
    return res.status(200).json({
      success: 1,
      data: newService,
      message: "Service created successfully",
    });
  }

  if (method === "PUT") {
    const { name } = body || {};
    const id = query.id;

    if (!id || !name || !name.trim()) {
      return res.status(400).json({
        success: 0,
        message: "Service ID and name are required",
      });
    }

    // In a real app, you'd update the database here
    const updatedService = {
      id: id,
      name: name.trim(),
    };

    return res.status(200).json({
      success: 1,
      data: updatedService,
      message: "Service updated successfully",
    });
  }

  if (method === "DELETE") {
    const id = query.id;

    if (!id) {
      return res.status(400).json({
        success: 0,
        message: "Service ID is required",
      });
    }

    // In a real app, you'd delete from database here
    return res.status(200).json({
      success: 1,
      data: {},
      message: "Service deleted successfully",
    });
  }

  res.setHeader("Allow", "GET,POST,PUT,DELETE");
  res.status(405).end("Method Not Allowed");
}
