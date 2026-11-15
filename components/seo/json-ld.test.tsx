import { describe, it, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "./json-ld";
describe("JSON-LD script boundary", () => {
  it("serializes script terminators safely without changing structured data", () => {
    const data = {
      name: "</script><svg/onload=window.__jsonld=1>",
      description: "line\u2028paragraph\u2029",
    };
    const html = renderToStaticMarkup(<JsonLd data={data} />);
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).not.toContain("<svg");
    expect(
      JSON.parse(
        html.slice(html.indexOf(">") + 1, html.lastIndexOf("</script>"))
      )
    ).toEqual(data);
  });
});
