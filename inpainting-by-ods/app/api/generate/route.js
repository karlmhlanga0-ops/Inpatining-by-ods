import Replicate from "replicate";
import { NextResponse } from "next/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    const { userFace, targetModelImage } = await request.json();

    const output = await replicate.run(
      "codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34",
      {
        input: {
          swap_image: userFace,
          input_image: targetModelImage,
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;
    return NextResponse.json({ success: true, result: imageUrl });
  } catch (error) {
    console.error("ODS Generation Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}