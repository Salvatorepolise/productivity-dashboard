import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

test("page ids are unique and all static JavaScript DOM bindings still exist", () => {
  assert.equal(new Set(ids).size, ids.length);
  const directory = new URL("../js/", import.meta.url);
  for (const filename of readdirSync(directory).filter((name) => name.endsWith(".js"))) {
    const source = readFileSync(new URL(filename, directory), "utf8");
    for (const match of source.matchAll(/getElementById\("([^"]+)"\)/g)) {
      assert.ok(ids.includes(match[1]), `${filename} references missing #${match[1]}`);
    }
  }
});

test("overview links and form labels point to real page elements", () => {
  for (const match of html.matchAll(/(?:href="#|for=")([^"]+)"/g)) {
    assert.ok(ids.includes(match[1]), `Missing target #${match[1]}`);
  }
});
