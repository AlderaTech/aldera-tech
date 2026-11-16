import { mock } from "bun:test";
import type { ImageProps } from "next/image";
import { createElement } from "react";
export const requests: ImageProps[] = [];
mock.module("next/image", () => ({
  default: (props: ImageProps) => {
    requests.push(props);
    return createElement("img", {
      alt: props.alt,
      src: typeof props.src === "string" ? props.src : "fixture-image",
      width: props.width,
      height: props.height,
    });
  },
}));
