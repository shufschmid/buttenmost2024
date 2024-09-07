import * as PImage from "pureimage";
import Stream from "stream";

// const logoWithWeight = require("logo.json");

export default defineEventHandler(async (event) => {
  const width = 470;
  const height = 250;
  const img1 = PImage.make(width, height);

  const ctx = img1.getContext("2d");

  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, width, height);

  var fnt = PImage.registerFont(
    "sourcesanspro-regular.ttf",
    "Source Sans Pro"
  );
  fnt.loadSync();
  ctx.fillStyle = "#ffffff";
  ctx.font = "48pt 'Source Sans Pro'";
  ctx.fillText("ABC", 80, 80);

  const pngData = [];

  const dest = new Stream();
  dest.writable = true;

  dest.write = function (data) {
    for (let i = 0; i < data.length; i++) {
      dest.emit("data", data[i]);
    }
  };

  // Act like a passThrough stream; in one ear and out the other.
  dest.on("data", (chunk) => {
    pngData.push(chunk);
  });

  dest.on("end", () => {});

  // For
  // https://github.com/joshmarinacci/node-pureimage/blob/6775bc3dedfd4247c0ee11382e1aebdf2703ca45/src/image.ts#L57
  dest.end = function () {
    dest.emit("finish");
  };

  dest.close = function () {
    dest.emit("close");
  };

  function assert(a, b) {
    if (a !== b) {
      throw new Error(`${a} !== ${b}`);
    } else {
      return true;
    }
  }

  const buf = await PImage.encodePNGToStream(img1, dest).then(() => {
    return new Uint8Array(pngData);
  });

  if (
    assert(buf[0], 0x89) &&
    assert(buf[1], 0x50) &&
    assert(buf[2], 0x4e) &&
    assert(buf[3], 0x47)
  ) {
    console.log("buffer contains png header");

    const ascii = Array.from(buf).map((b) => String.fromCharCode(b));
    const b64 = btoa(ascii.join(""));

    console.log(b64);
    
  return Response.json(b64, { status: 200 });
  }
});
