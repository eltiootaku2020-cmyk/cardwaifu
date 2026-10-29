import "dotenv/config";
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";

const source = resolve(process.env.DATABASE_PATH ?? "./data/umbra.sqlite");
const backupDirectory = resolve(process.env.BACKUP_DIRECTORY ?? "./backups");
const retentionCount = 10;
const backupNamePattern = /^umbra-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.sqlite$/;

async function main(): Promise<void> {
  if (!existsSync(source)) {
    throw new Error("Todavía no existe la base de datos. Abre UMBRA y crea el progreso local antes de respaldar.");
  }

  mkdirSync(backupDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/:/g, "-").replace(/\./g, "-");
  const destination = join(backupDirectory, `umbra-backup-${timestamp}.sqlite`);
  const { db } = await import("./db.js");

  try {
    await db.backup(destination);
    const size = statSync(destination).size;
    if (size < 1) {
      unlinkSync(destination);
      throw new Error("La copia resultó vacía y se descartó.");
    }

    const backups = readdirSync(backupDirectory)
      .filter(name => backupNamePattern.test(name))
      .sort((left, right) => right.localeCompare(left));

    for (const obsolete of backups.slice(retentionCount)) {
      unlinkSync(join(backupDirectory, obsolete));
    }

    console.log("Copia de seguridad creada correctamente.");
    console.log("Archivo: " + destination);
    console.log("Tamaño: " + Math.ceil(size / 1024) + " KB");
    console.log("Se conservan las últimas " + retentionCount + " copias generadas automáticamente.");
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "No se pudo crear la copia de seguridad.");
  process.exitCode = 1;
});
