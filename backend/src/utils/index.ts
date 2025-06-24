import fs from "fs"

export async function createDirectory(dir: string) {
    await fs.promises.mkdir(dir, { recursive: true });
}
