import { ImageResponse } from "next/og";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "~/lib/constants";

export const alt = PROJECT_TITLE;
export const contentType = "image/png";

// Create reusable options object
let imageOptions: any = null;

// Initialize fonts
async function initializeFonts() {
  if (imageOptions) return imageOptions;

  try {
    imageOptions = {
      width: 1200,
      height: 630,
    };

    return imageOptions;
  } catch (error) {
    throw error;
  }
}

export default async function Image() {
  const options = await initializeFonts();

  return new ImageResponse(
    (
      <div
        tw="h-full w-full flex flex-col justify-center items-center relative"
        style={{
          background: "linear-gradient(to bottom, #1a1a2e, #16213e)",
          color: "white",
        }}
      >
        {/* Sun rays background */}
        <div
          tw="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at center, #ffd700 0%, transparent 70%)",
          }}
        />
        
        {/* Main content */}
        <div tw="flex flex-col items-center justify-center p-8">
          <h1 tw="text-8xl font-bold mb-4 text-center" style={{ color: "#ffd700" }}>
            {PROJECT_TITLE}
          </h1>
          <p tw="text-3xl text-center text-gray-300 max-w-2xl">
            {PROJECT_DESCRIPTION}
          </p>
        </div>

        {/* Decorative elements */}
        <div
          tw="absolute bottom-8 right-8 w-32 h-32 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle at center, #ffd700 0%, transparent 70%)",
          }}
        />
      </div>
    ),
    options,
  );
}
