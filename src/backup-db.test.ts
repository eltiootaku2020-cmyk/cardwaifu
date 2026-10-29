import assert from "node:assert/strict";
import test from "node:test";
import Database from "better-sqlite3";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("SQLite online backup preserves schema and committed rows", async t => {
  const directory = mkdtempSync(join(tmpdir(), "umbra-sqlite-backup-test-"));
  const sourcePath = join(directory, "source.sqlite");
  const backupPath = join(directory, "backup.sqlite");
  const source = new Database(sourcePath);
  let copy: Database | undefined;

  t.after(() => {
    copy?.close();
    source.close();
    rmSync(directory, { recursive: true, force: true });
  });

  source.exec("CREATE TABLE progress (player TEXT NOT NULL, chapter INTEGER NOT NULL)");
  source.prepare("INSERT INTO progress(player, chapter) VALUES (?, ?)").run("local-test-player", 1);

  await source.backup(backupPath);
  copy = new Database(backupPath, { readonly: true });
  const restored = copy.prepare("SELECT player, chapter FROM progress").get() as { player: string; chapter: number };

  assert.deepEqual(restored, { player: "local-test-player", chapter: 1 });
  const sourceCount = source.prepare("SELECT COUNT(*) AS count FROM progress").get() as { count: number };
  assert.equal(sourceCount.count, 1);
});
