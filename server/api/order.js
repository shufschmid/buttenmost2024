
export default defineEventHandler(async event => {
  try {
    let body = await readBody(event);
    console.log(body);
  } catch (error) {
    console.error("[ERROR] Problem with request:", error);
    return new Response("[ERROR] Problem with request", { status: 400 });
  }
});
