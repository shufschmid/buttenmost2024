import twilio from "twilio";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    console.log("Received SMS request:", { body  });

  // Only allow POST
  if (event.method !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }


  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);
  try {
    const message = await client.messages.create({
      body: body.sms,
      from: "+17019350544",
      to: body.to
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ messageSid: message.sid })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
});