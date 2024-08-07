import { createSystem } from "frog/ui";

export const {
  Box,
  Image,
  Icon,
  Text,
  VStack,
  Spacer,
  vars
} = createSystem({
  colors: {
    bg: "rgb(255, 255, 255)",
    white: "rgb(245, 254, 255)",
    black: "rgb(0, 0, 0)",
    red: "rgb(232, 36, 56)",
  },
  fonts: {
    default: [
      {
        name: "Pixelify Sans",
        source: "google",
        weight: 400,
      },
      {
        name: "Pixelify Sans",
        source: "google",
        weight: 600,
      },
    ],
    pixelify_sans: [
      {
        name: "Pixelify Sans",
        source: "google",
        weight: 600,
      },
    ],
  },
});
