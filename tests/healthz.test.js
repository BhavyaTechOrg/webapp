const request = require("supertest");
const app = require("../index"); // Import the app
const sequelize = require("../config/db"); // Import Sequelize instance
const HealthCheck = require("../models/HealthCheck"); // Import the model

// Mock the HealthCheck model to prevent real DB interactions
jest.mock("../models/HealthCheck", () => ({
  create: jest.fn(),
}));

//  Mock Sequelize to prevent real DB interactions
jest.mock("../config/db", () => ({
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
  close: jest.fn().mockResolvedValue(),
  define: jest.fn().mockReturnValue({}), //  Ensure define() is available
}));

beforeAll(async () => {
  try {
    await sequelize.authenticate(); //  Mocked DB connection
    await sequelize.sync(); //  Mocked schema sync
  } catch (error) {
    console.warn(" Database is not available. Tests will continue with mocks.");
  }
});

afterAll(async () => {
  await sequelize.close(); //  Ensure DB connection is closed after tests
});

describe("/healthz API Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 OK when health check is successful", async () => {
    HealthCheck.create.mockResolvedValue({}); // Simulate a successful DB insert

    const response = await request(app).get("/healthz");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({});
    expect(response.headers["cache-control"]).toBe("no-cache, no-store, must-revalidate");
  });

  it("should return 400 Bad Request if payload is sent", async () => {
    const response = await request(app).get("/healthz").send({ key: "value" });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({});
  });

  it("should return 400 Bad Request if query parameters are sent", async () => {
    const response = await request(app).get("/healthz?param=value");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({});
  });

  it("should return 503 Service Unavailable when DB insert fails", async () => {
    HealthCheck.create.mockRejectedValue(new Error("Database error")); //  Simulate DB failure

    const response = await request(app).get("/healthz");
    expect(response.status).toBe(503);
    expect(response.body).toEqual({});
  });

  it("should return 405 Method Not Allowed for unsupported methods", async () => {
    const response = await request(app).post("/healthz");
    expect(response.status).toBe(405);
    expect(response.body).toEqual({});
  });
});
