const state = vi.hoisted(() => ({
  proxy: vi.fn(),
}));

vi.mock("@replit/connectors-sdk", () => ({
  ReplitConnectors: class {
    proxy = state.proxy;
  },
}));

import { sendEnquiryEmail } from "./enquiries";

beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_URL;
  delete process.env.EMAIL_FROM;
  delete process.env.EMAIL_TO;
  delete process.env.EMAIL_CC;
  state.proxy.mockReset();
  state.proxy.mockResolvedValue(
    new Response(JSON.stringify({ id: "email-id" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("sends enquiries to every approved administrator and always copies the required address", async () => {
  await sendEnquiryEmail({
    name: "Client",
    email: "client@example.com",
    organization: "Example",
    subject: "Test enquiry",
    message: "Please contact me.",
  });

  expect(state.proxy).toHaveBeenCalledTimes(1);
  const [, , request] = state.proxy.mock.calls[0];
  const body = JSON.parse(request.body);
  expect(body.to).toEqual([
    "sunny@reclaimingthegreengold.com",
    "soobaschand@reclaimingthegreengold.com",
  ]);
  expect(body.from).toBe("RGG Website <enquiries@ganjanation.org>");
  expect(body.cc).toEqual(["sweenmru@gmail.com"]);
  expect(body.reply_to).toBe("client@example.com");
});

it("uses direct Resend configuration outside Replit", async () => {
  process.env.RESEND_API_KEY = "test-key";
  process.env.RESEND_API_URL = "https://resend.example.test/emails";
  process.env.EMAIL_FROM = "RGG <website@example.test>";
  process.env.EMAIL_TO = "owner@example.test,editor@example.test";
  process.env.EMAIL_CC = "archive@example.test";
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ id: "portable-email-id" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);

  await sendEnquiryEmail({
    name: "Client",
    email: "client@example.com",
    subject: "Portable enquiry",
    message: "Please contact me.",
  });

  expect(state.proxy).not.toHaveBeenCalled();
  expect(fetchMock).toHaveBeenCalledWith(
    "https://resend.example.test/emails",
    expect.objectContaining({
      headers: expect.objectContaining({
        authorization: "Bearer test-key",
      }),
    }),
  );
  const request = fetchMock.mock.calls[0][1];
  expect(JSON.parse(request.body)).toMatchObject({
    from: "RGG <website@example.test>",
    to: ["owner@example.test", "editor@example.test"],
    cc: ["archive@example.test"],
    reply_to: "client@example.com",
  });
});