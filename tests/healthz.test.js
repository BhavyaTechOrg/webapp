const request = require("supertest");
const app = require("../index"); // Import the app
const HealthCheck = require("../models/HealthCheck"); // Mock this in tests

jest.mock("../models/HealthCheck"); // Mock the HealthCheck model

describe("/healthz API Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 OK when health check is successful", async () => {
    // Mock successful DB insert
    HealthCheck.create.mockResolvedValue({});

    const response = await request(app).get("/healthz");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({}); // Empty response body
    expect(response.headers["cache-control"]).toBe("no-cache, no-store, must-revalidate");
  });

  it("should return 400 Bad Request if payload is sent", async () => {
    const response = await request(app).get("/healthz").send({ key: "value" });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({}); // Empty response body
  });

  it("should return 400 Bad Request if query parameters are sent", async () => {
    const response = await request(app).get("/healthz?param=value");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({}); // Empty response body
  });

  it("should return 503 Service Unavailable when DB insert fails", async () => {
    // Mock DB insert failure
    HealthCheck.create.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/healthz");
    expect(response.status).toBe(503);
    expect(response.body).toEqual({}); // Empty response body
  });

  it("should return 405 Method Not Allowed for unsupported methods", async () => {
    const response = await request(app).post("/healthz");
    expect(response.status).toBe(405);
    expect(response.body).toEqual({}); // Empty response body
  });
});
