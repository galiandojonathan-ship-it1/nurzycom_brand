// Exercise the private catalog verifier with a throwaway key and invented content.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../private/append-practice.mjs", import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "practice-test-"));
const key = randomBytes(32);
const keyPath = join(dir, "fixture.key");
const input = join(dir, "fixture.bin");

function seal(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, encrypted, cipher.getAuthTag()]);
}
function question(i, gradingLetter, reviewLetter = gradingLetter) {
  const h = createHash("sha256").update(`fixture:${i}:${gradingLetter}`).digest("hex").slice(0, 16);
  return { i, h, o: ["One", "Two", "Three", "Four"], x: seal({ a: reviewLetter, x: "private example" }).toString("base64") };
}
function verify(questions) {
  const fixture = seal({ sets: [{ id: "X01", salt: "fixture", q: questions }] });
  writeFileSync(input, fixture);
  const result = spawnSync(process.execPath, [script, "--verify", keyPath, input], { encoding: "utf8" });
  assert.deepEqual(readFileSync(input), fixture, "verification did not write to the input");
  assert.doesNotMatch(result.stdout + result.stderr, /private example/);
  return result;
}

try {
  writeFileSync(keyPath, key.toString("base64"), { mode: 0o600 });
  const valid = verify([... "ABCD"].map((letter, i) => question(i + 1, letter)));
  assert.equal(valid.status, 0, valid.stderr);
  assert.match(valid.stdout, /Checked 4 questions in 1 sets\. Issues: 0/);

  const invalid = verify([
    question(1, "B", "D"),
    { ...question(2, "A"), h: "not-a-hash" },
    { ...question(3, "C"), x: "not-a-review-record" },
    { ...question(4, "D"), o: ["One", "Two", "Three", "One "] },
    question(4, "A"),
  ]);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /position 1: The review key and the grading key disagree/);
  assert.match(invalid.stderr, /position 2: The grading hash does not resolve/);
  assert.match(invalid.stderr, /position 3: The review record could not be opened/);
  assert.match(invalid.stderr, /position 4: Expected four distinct answer choices/);
  assert.match(invalid.stderr, /position 5: Invalid or repeated question number/);
  assert.match(invalid.stdout, /Issues: 5/);
  console.log("PASS read-only hard-practice catalog verification");
} finally {
  rmSync(dir, { recursive: true });
}
