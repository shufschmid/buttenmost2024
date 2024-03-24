export default defineEventHandler(async (event) => {
    let body = await readBody(event);
    if(body.Passwort == process.env.ADMIN_PWD){
        return {
            statusCode: 200,
            body: true,
          };
    }
    else{
        return {
            statusCode: 200,
            body: false,
          };
    }
  });